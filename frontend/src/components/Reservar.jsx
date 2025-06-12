import React, { useEffect, useState } from 'react';
import { authenticatedFetch, getUserId } from '../utils/authService';
import { useNavigate } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import '../css/Reservas.css';

function Reservar() {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pendingSeat, setPendingSeat] = useState(null);
    const trainId = 1;
    const userId = getUserId();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await authenticatedFetch(`/api/seats/${trainId}`);
                if (!res) return;
                const data = await res.json();
                if (data.success && data.seats) {
                    setSeats(data.seats.map(seat => ({
                        id: seat.id,
                        seatNumber: seat.seat_number,
                        railcar: seat.railcar_number,
                        isOccupied: seat.is_occupied,
                        reservedBy: seat.reserved_by
                    })));
                }
                setLoading(false);
            } catch (error) {
                console.warn('Error al cargar asientos:', error);
                setLoading(false);
            }
        };

        // Cargar asientos inicialmente
        fetchSeats();

        // Configurar actualización periódica cada 3 segundos
        const intervalId = setInterval(fetchSeats, 500);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, [trainId]);

    const handleReservation = async (seat) => {
        if (!userId) {
            alert('Necesitas iniciar sesión para reservar un asiento');
            return;
        }

        try {
            const response = await authenticatedFetch(`/api/seats/reserve`, {
                method: 'POST',
                body: JSON.stringify({
                    trainId: trainId,
                    railcarNumber: seat.railcar,
                    seatNumber: seat.seatNumber
                })
            });

            if (!response) return;

            const data = await response.json();

            if (data.success) {
                setSeats(seats.map(s =>
                    s.id === seat.id
                        ? { ...s, reservedBy: parseInt(userId, 10) }
                        : s
                ));
                alert('Asiento reservado exitosamente');
            } else {
                alert(data.message || 'No se pudo reservar el asiento');
            }
        } catch (error) {
            console.error('Error reservando asiento:', error);
            alert('Error al reservar el asiento');
        } finally {
            setPendingSeat(null);
        }
    };

    if (loading) {
        return <div className="loading">Cargando asientos...</div>;
    }

    return (
        <div className="reservar-container">
            <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                <NavigationMenu />
            </div>
            <h2 className="reservar-title">Pick your place</h2>
            {seats.length === 0 ? (
                <p>No hay asientos disponibles</p>
            ) : (
                <div className="seats-grid">
                    {seats.map((seat) => (
                        <div key={`${seat.railcar}-${seat.seatNumber}`} className="seat-container">
                            <span className="seat-label">Seat {seat.seatNumber}</span>
                            <div
                                className="seat-circle"
                                style={{
                                    backgroundColor: seat.isOccupied
                                        ? '#e74c3c'
                                        : seat.reservedBy !== null
                                            ? seat.reservedBy === parseInt(userId, 10)
                                                ? '#3498db'
                                                : '#f39c12'
                                            : '#4caf50',
                                    cursor: !seat.isOccupied &&
                                    seat.reservedBy === null
                                        ? 'pointer' : 'default'
                                }}
                                title={
                                    seat.isOccupied
                                        ? 'Ocupado'
                                        : seat.reservedBy
                                            ? 'Reservado'
                                            : 'Libre - Click para reservar'
                                }
                                onClick={() => {
                                    if (seat.isOccupied || seat.reservedBy !== null) return;
                                    setPendingSeat(seat);
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {pendingSeat && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p className="modal-text">¿Estás seguro que querés reservar este asiento?</p>
                        <div className="modal-buttons">
                            <button className="modal-btn confirm" onClick={() => handleReservation(pendingSeat)}>Sí</button>
                            <button className="modal-btn cancel" onClick={() => setPendingSeat(null)}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservar;
