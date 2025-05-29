import React, { useEffect, useState } from 'react';
import '../css/Reservas.css';

function Reservar() {

    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const trainId = 1; // Cambiar por el ID del tren correspondiente
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/seats/${trainId}`);
                const data = await res.json();

                if (data.success && data.seats) {
                    // Mapear la estructura correcta de datos
                    setSeats(data.seats.map(seat => ({
                        id: seat.seat_number,
                        railcar: seat.railcar_number,
                        isOccupied: seat.is_occupied,
                        reservedBy: seat.reserved_by // Ahora reserved_by es un INTEGER en la BD
                    })));
                }
                setLoading(false);
            } catch (error) {
                console.warn('Error al cargar asientos:', error);
                setLoading(false);
            }
        };

        fetchSeats();
    }, [trainId]);

    const handleReservation = async (seat) => {
        try {
            // Asegurarse de que userId sea un número entero
            const numericUserId = parseInt(userId, 10);

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/seats/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trainId: trainId,
                    railcarNumber: seat.railcar,
                    seatNumber: seat.id,
                    userId: numericUserId
                })
            });

            const data = await response.json();
            console.log('Respuesta del backend:', data);
            if(data.success) {
                // Actualizar el estado local con el userId como número
                setSeats(seats.map(s =>
                    s.id === seat.id && s.railcar === seat.railcar
                        ? { ...s, reservedBy: numericUserId }
                        : s
                ));
            } else {
                alert(data.message || 'No se puede reservar el asiento');
            }
        } catch (error) {
            console.error('Error reservando asiento:', error);
            alert('Error reservando asiento');
        }
    };

    if (loading){
        return <div className="loading">Cargando asientos...</div>;
    }

    return (
        <div className="reservar-container">
            <h2 className="reservar-title">Pick your place</h2>
            {seats.length === 0 ? (
                <p>No hay asientos disponibles</p>
            ) : (
            <div className="seats-grid">
                {seats.map((seat) => (
                    <div key={`${seat.railcar}-${seat.id}`} className="seat-container">
                        <span className="seat-label">Seat {seat.id}</span>
                        <div
                            className="seat-circle"
                            style={{
                                backgroundColor: seat.isOccupied
                                    ? '#e74c3c' // rojo para ocupado
                                    : seat.reservedBy !== null
                                        ? '#f39c12' // naranja para reservado
                                        : '#4caf50', // verde para libre
                                cursor: !seat.isOccupied && seat.reservedBy === null ? 'pointer' : 'default'
                            }}
                            title={seat.isOccupied
                                ? 'Ocupado'
                                : seat.reservedBy
                                    ? seat.reservedBy === parseInt(userId, 10)
                                        ? 'Reservado por ti'
                                        : 'Reservado por otro usuario'
                                    : 'Libre'}
                            onClick={() => {
                                if (!seat.isOccupied && !seat.reservedBy) {
                                    handleReservation(seat);
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}

export default Reservar;
