import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/home');
    };
    const [activeTab, setActiveTab] = useState(null);
    const tabs = [
        { id: "tab1", label: "Register" },
        { id: "tab2", label: "Login" }
    ];


    return (
        <div className="landing-container">
            {activeTab === null && (<div className="box-Welcome">
                <h1>Welcome</h1>
                <p>Reserva tu lugar</p>
                <button onClick={handleClick}>Get Started</button>
            </div>)} {/*//null tab , mi inicio*/}
            <div className="tab-section">
                <div className="NavigateOption">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-bottom ${
                                activeTab === tab.id
                                    ? 'active-tab'
                                    : activeTab === null
                                        ? 'neutral-tab'
                                        : 'inactive-tab'
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                {activeTab === "tab1" && (
                    <div className="box-navigation">
                        <h2>Register</h2>
                    </div>
                )}
                {activeTab === "tab2" && (
                    <div className="box-navigation">
                        <h2>Login</h2>
                    </div>
                )}
            </div>

        </div>
    );
};

export default LandingPage;