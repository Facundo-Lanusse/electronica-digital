import React, { useEffect, useState } from 'react';
import { authenticatedFetch, getUserId } from '../utils/authService';
import '../css/Reservas.css';

function Reservar() {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myReservations, setMyReservations] = useState([]);
    const trainId = 1; // Cambiar por el ID del tren correspondiente
    const userId = getUserId(); // Obtener el ID de usuario del token JWT

    // Cargar asientos
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await authenticatedFetch(`/api/seats/${trainId}`);

                if (!res) return; // Si no hay respuesta (posiblemente por redirección en authService)

                const data = await res.json();

                if (data.success && data.seats) {
                    // Mapear la estructura correcta de datos
                    setSeats(data.seats.map(seat => ({
                        id: seat.id,
                        seatNumber: seat.seat_number,
                        railcar: seat.railcar_number,
                        isOccupied: seat.is_occupied,
                        reservedBy: seat.reserved_by // ID del usuario que reservó
                    })));
                }
                setLoading(false);
            } catch (error) {
                console.warn('Error al cargar asientos:', error);
                setLoading(false);
            }
        };

        // Cargar reservaciones del usuario actual
        const fetchMyReservations = async () => {
            try {
                const res = await authenticatedFetch(`/api/reservations/my`);

                if (!res) return;

                const data = await res.json();

                if (data.success && data.reservations) {
                    setMyReservations(data.reservations);
                }
            } catch (error) {
                console.warn('Error al cargar reservaciones:', error);
            }
        };

        fetchSeats();
        fetchMyReservations();
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
                // Actualizar el estado local
                setSeats(seats.map(s =>
                    s.id === seat.id
                        ? { ...s, reservedBy: parseInt(userId, 10) }
                        : s
                ));

                // Actualizar mis reservaciones
                const updatedReservations = await authenticatedFetch(`/api/reservations/my`);
                if (updatedReservations) {
                    const reservationsData = await updatedReservations.json();
                    if (reservationsData.success) {
                        setMyReservations(reservationsData.reservations);
                    }
                }

                alert('Asiento reservado exitosamente');
            } else {
                alert(data.message || 'No se pudo reservar el asiento');
            }
        } catch (error) {
            console.error('Error reservando asiento:', error);
            alert('Error al reservar el asiento');
        }
    };

    const handleCancelReservation = async (seat) => {
        if (!userId) {
            alert('Necesitas iniciar sesión para cancelar una reserva');
            return;
        }

        try {
            const response = await authenticatedFetch(`/api/seats/cancel`, {
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
                // Actualizar el estado local
                setSeats(seats.map(s =>
                    s.id === seat.id
                        ? { ...s, reservedBy: null }
                        : s
                ));

                // Actualizar mis reservaciones
                const updatedReservations = await authenticatedFetch(`/api/reservations/my`);
                if (updatedReservations) {
                    const reservationsData = await updatedReservations.json();
                    if (reservationsData.success) {
                        setMyReservations(reservationsData.reservations);
                    }
                }

                alert('Reserva cancelada exitosamente');
            } else {
                alert(data.message || 'No se pudo cancelar la reserva');
            }
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            alert('Error al cancelar la reserva');
        }
    };

    if (loading) {
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
                        <div key={`${seat.railcar}-${seat.seatNumber}`} className="seat-container">
                            <span className="seat-label">Seat {seat.seatNumber}</span>
                            <div
                                className="seat-circle"
                                style={{
                                    backgroundColor: seat.isOccupied
                                        ? '#e74c3c' // rojo para ocupado
                                        : seat.reservedBy !== null
                                            ? seat.reservedBy === parseInt(userId, 10)
                                                ? '#3498db' // azul para reservado por el usuario actual
                                                : '#f39c12' // naranja para reservado por otro
                                            : '#4caf50', // verde para libre
                                    cursor: !seat.isOccupied &&
                                            (seat.reservedBy === null || seat.reservedBy === parseInt(userId, 10))
                                            ? 'pointer' : 'default'
                                }}
                                title={seat.isOccupied
                                    ? 'Ocupado'
                                    : seat.reservedBy
                                        ? seat.reservedBy === parseInt(userId, 10)
                                            ? 'Reservado por ti - Click para cancelar'
                                            : 'Reservado por otro usuario'
                                        : 'Libre - Click para reservar'}
                                onClick={() => {
                                    if (seat.isOccupied) return; // No hacer nada si está ocupado

                                    if (seat.reservedBy === parseInt(userId, 10)) {
                                        handleCancelReservation(seat); // Cancelar si es tuyo
                                    } else if (seat.reservedBy === null) {
                                        handleReservation(seat); // Reservar si está libre
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {myReservations.length > 0 && (
                <div className="my-reservations">
                    <h3>Mis Reservas</h3>
                    <ul className="reservation-list">
                        {myReservations.map(reservation => (
                            <li key={reservation.id} className="reservation-item">
                                <span>Asiento {reservation.seat_number}, Vagón {reservation.railcar_number}</span>
                                <span className={`status ${reservation.status}`}>{reservation.status}</span>
                                <span>{new Date(reservation.reservation_date).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Reservar;
