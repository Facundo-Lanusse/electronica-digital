import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    const handleClick = () => {
            navigate('/home');
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        console.log("📤 Intentando registrar usuario...");
        console.log("🌍 Backend URL:", BACKEND_URL);

        if (!name || !email || !password || !confirmPassword) {
            alert("Todos los campos son obligatorios");
            return;
        }

        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            console.log("📥 Respuesta del backend:", data);

            if (response.ok) {
                alert('✅ Usuario registrado con éxito');
                setActiveTab("tab2"); // Redirigir al login
            } else {
                alert(data.error || '❌ Error al registrar');
            }
        } catch (error) {
            console.error('🚨 Error en registro:', error);
            alert('❌ Fallo de conexión con el servidor');
        }
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
            </div>
                {activeTab === "tab1" && (
                    <div className="form-wrapper">
                    <div className="register-container">
                        <h1 className="register-title">Register <br /> now!</h1>
                        <p className="register-subtitle">
                            Sign up with your email and password to continue
                        </p>
                        <form className="register-form" onSubmit={handleRegister}>
                            <div className="input-group">
                                <i className='bx bx-user userIcon'></i>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={name}
                                    onChange={(e) =>   setName(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <img src="EnvelopeSimple.svg" alt="Email Icon" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) =>   setEmail(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <img src="Lock.svg" alt="Password Icon" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>   setPassword(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <img src="Lock.svg" alt="Confirm Password Icon" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) =>   setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className="signInWrapper">
                                <button type="submit" className="signIn">Sign Up</button>
                            </div>
                        </form>

                        <div className="login-divider">
                            <div className="line" />
                            <span className="or">Or continue with</span>
                            <div className="line" />
                        </div>

                        <div className="register-google">
                            <img src="/Clip path group.svg" alt="Google logo" />
                            <img src="/VectorGoogle.svg" alt="Google text" />
                        </div>

                        <div className="footer-div">
                            <div className="register-footer">
                                Already have an account?{' '}
                                <span className="link" onClick={() => setActiveTab("tab2")}>
                    Sign in here
                </span>
                            </div>
                        </div>
                    </div>
                    </div> )}
                {activeTab === "tab2" && (
                    <div className="box-navigation">
                        <h2>Login</h2>
                    </div>
                    )}



        </div>
    );
};

export default LandingPage;