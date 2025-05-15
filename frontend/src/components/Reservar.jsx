import React, { useEffect, useState } from 'react';
import '../css/Reservas.css';

function Reservar() {
    const defaultSeats = [
        { id: 1, is_occupy: true },
        { id: 2, is_occupy: true },
        { id: 3, is_occupy: false },
        { id: 4, is_occupy: false },
        { id: 5, is_occupy: false },
        { id: 6, is_occupy: false }
    ];

    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const trainId = 1; // Cambiar por el ID del tren correspondiente

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await fetch(`BACKEND_URL/api/seats/${trainId}`);
                const data = await res.json();

                if (data.success && data.seats) {
                    // Mapear la estructura correcta de datos
                    setSeats(data.seats.map(seat => ({
                        id: seat.seat_number,
                        railcar: seat.railcar_number,
                        is_occupy: seat.is_occupied,
                        reserved_by: seat.reserved_by
                    })));
                }
                setLoading(false);
            } catch (error) {
                console.warn('Error al cargar asientos:', error);
                setLoading(false);
            }
        };

        fetchSeats();
        const intervalId = setInterval(fetchSeats, 3000);

        return () => clearInterval(intervalId);
    }, [trainId]);

    return (
        <div className="reservar-container">
            <h2 className="reservar-title">Pick your place</h2>
            <div className="seats-grid">
                {seats.map((seat) => (
                    <div key={seat.id} className="seat-container">
                        <span className="seat-label">Seat {seat.id}</span>
                        <div
                            className="seat-circle"
                            style={{
                                backgroundColor: seat.is_occupy ? '#e74c3c' : '#4caf50'
                            }}
                            title={seat.is_occupy ? 'Ocupado' : 'Libre'}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Reservar;
