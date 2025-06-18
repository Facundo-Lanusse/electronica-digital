import React, { useEffect, useState } from 'react';
import { authenticatedFetch } from '../utils/authService';
import '../css/MisReservas.css';
import NavigationMenu from "./NavigationMenu";

function MisReservas() {
    const [myReservations, setMyReservations] = useState([]);
    const name = localStorage.getItem('name') || 'Invitado';

    useEffect(() => {
        const fetchMyReservations = async () => {
            try {
                const res = await authenticatedFetch(`/api/reservations/my`);
                if (!res) return;

                const data = await res.json();
                if (data.success && data.reservations) {
                    const activas = data.reservations
                        .filter(r => r.status === 'active')
                        .sort((a, b) => new Date(b.reservation_date) - new Date(a.reservation_date));

                    setMyReservations(activas);
                }

                /*if (data.success && data.reservations) {
                    const activas = data.reservations.filter(r => r.status !== 'cancelled');
                    setMyReservations(activas); }*/
            } catch (error) {
                console.warn('Error al cargar reservaciones:', error);
            }
        };

        fetchMyReservations();
    }, []);

    const handleCancelReservation = async (reservation) => {
        try {
            const response = await authenticatedFetch(`/api/seats/cancel`, {
                method: 'POST',
                body: JSON.stringify({
                    trainId: reservation.train_id,
                    railcarNumber: reservation.railcar_number,
                    seatNumber: reservation.seat_number
                })
            });

            if (!response) return;

            const data = await response.json();
            if (data.success) {
                setMyReservations((prev) =>
                    prev.map(r =>
                        r.id === reservation.id ? { ...r, status: 'cancelled' } : r
                    )
                );
                alert('Reserva cancelada exitosamente');
            } else {
                alert(data.message || 'No se pudo cancelar la reserva');
            }
        } catch (error) {
            console.error('Error cancelando reserva:', error);
            alert('Error al cancelar la reserva');
        }
    };

    return (

        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
            <div className="menu-flotante">
                <NavigationMenu/>
            </div>

            <div className="misreservas-container">
                <div className="header-section">
                    <div className="user-info">
                        <h2>{name}</h2>
                        <p className="misreservas-subtitle">Mirá tu lista de reservas…</p>
                    </div>
                    <div className="header-icon">🚆</div>
                </div>

                <h1 className="misreservas-title">Mis Reservas</h1>

                {myReservations.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No tenés reservas activas</p>
                    </div>
                ) : (
                    <div className="misreservas-scroll">
                        {myReservations.map((r) => (
                            <div className={`reservation-card ${r.status === 'cancelled' ? 'cancelled' : ''}`}
                                 key={r.id}>
                                <div className="reservation-icon">🚆</div>
                                <div className="reservation-details">
                                    <p className="reserva-text">Asiento {r.seat_number}, Vagón {r.railcar_number}</p>
                                    <p className="reserva-date">
                                        {r.status === 'cancelled'
                                            ? 'Reserva cancelada'
                                            : new Date(r.reservation_date).toLocaleDateString('es-AR', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                    </p>
                                </div>
                                {r.status !== 'cancelled' && (
                                    <button
                                        className="cancelar-btn"
                                        onClick={() => handleCancelReservation(r)}
                                        title="Cancelar reserva"
                                    >
                                        ✖
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MisReservas;
