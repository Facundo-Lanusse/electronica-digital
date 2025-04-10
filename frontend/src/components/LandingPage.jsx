import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/home');
    };

    return (
        <div className="landing-page">
            <div className="overlay">
                <h1>Welcome</h1>
                <p>Reserva tu lugar</p>
                <button onClick={handleClick}>Get Started</button>
            </div>
        </div>
    );
};

export default LandingPage;