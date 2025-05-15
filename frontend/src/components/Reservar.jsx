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

    const [seats, setSeats] = useState(defaultSeats);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const res = await fetch('https://BACKEND_URL/api/seats');
                const data = await res.json();
                setSeats(data);
            } catch (error) {
                console.warn('Backend no disponible, usando datos por defecto');
            }
        };

        fetchSeats();
        const intervalId = setInterval(fetchSeats, 3000);

        return () => clearInterval(intervalId);
    }, []);

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
