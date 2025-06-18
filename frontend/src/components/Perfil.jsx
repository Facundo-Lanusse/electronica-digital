import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Perfil.css';
import NavigationMenu from "./NavigationMenu";

const Perfil = () => {
    const navigate = useNavigate();

    const name = localStorage.getItem('name') || 'Invitado';

    return (
        <div>
            <div className="menu-flotante">
                <NavigationMenu/>
            </div>
            <div className="perfil-container">
                <div className="perfil-card">
                        <div className="perfil-header"/>

                        <div className="perfil-avatar">
                            <img src="/ProfilePic.jpg" alt="avatar"/>
                        </div>

                        <h2 className="perfil-name">{name}</h2>
                        <p className="perfil-role">TrainManagement guest</p>


                        <div className="perfil-actions">
                            <div className="perfil-button" onClick={() => navigate('/reservar')}>
                                <p className="perfil-button-title">Reservar</p>
                                <p className="perfil-button-sub">¡No te quedes sin lugar!</p>
                                <span className="arrow">→</span>
                            </div>
                            <div className="perfil-button" onClick={() => navigate('/misreservas')}>
                                <p className="perfil-button-title">Mis Reservas</p>
                                <p className="perfil-button-sub">Mirá tu lista de reservas</p>
                                <span className="arrow">→</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
            };

            export default Perfil;
