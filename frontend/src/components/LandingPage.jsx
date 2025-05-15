import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/LandingPage.css';
import { jwtDecode } from 'jwt-decode';

const LandingPage = ({ FormHandle }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(null);
    const tabs = [
        { id: "tab1", label: "Register" },
        { id: "tab2", label: "Login" }
    ];

    // Campos de formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [type, setType] = useState('password');
    const [rememberMe, setRememberMe] = useState(false);

    const handleToggle = () => {
        setType(type === 'password' ? 'text' : 'password');
    };

    const handleClick = () => {
        navigate('/home');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || 'Login fallido');
                return;
            }

            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("token", data.token);
            const decoded = jwtDecode(data.token);
            localStorage.setItem("tokenData", JSON.stringify(decoded));

            FormHandle("HomePage");
            navigate("/home");

        } catch (error) {
            console.error('Error en login:', error);
            alert('Error inesperado al iniciar sesión');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || 'Registro fallido');
                return;
            }

            alert("Registro exitoso, ahora podés iniciar sesión");
            setActiveTab("tab2");
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

        } catch (error) {
            console.error('Error en registro:', error);
            alert('Error inesperado al registrarse');
        }
    };

    return (
        <div className="landing-container">
            {activeTab === null && (
                <div className="box-Welcome">
                    <h1 className="hero-title">
                        <span className="small">Welcome to</span>
                        <span className="big">TrainManager</span>
                    </h1>
                    <p>Reserva tu lugar</p>
                    <button onClick={handleClick}>Get Started</button>
                </div>
            )}

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
                        <h1 className="register-title">Register now!</h1>
                        <p className="register-subtitle">
                            Sign up with your email and password to continue
                        </p>
                        <form className="register-form" onSubmit={handleRegister}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="signInWrapper">
                                <button type="submit" className="signIn">Sign Up</button>
                            </div>
                        </form>
                        <div className="footer-div">
                            <div className="register-footer">
                                Already have an account?{' '}
                                <span className="link" onClick={() => setActiveTab("tab2")}>
                  Sign in here
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "tab2" && (
                <div className="form-wrapper">
                    <div className="register-container">
                        <h1 className="register-title">Welcome back!</h1>
                        <p className="register-subtitle">
                            Access your account securely
                        </p>
                        <form className="register-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type={type}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span className="toggle-password-icon" onClick={handleToggle}>
                  {type === 'password' ? '👁️' : '🙈'}
                </span>
                            </div>
                            <div className="remember-me">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMe">Remember me</label>
                            </div>
                            <div className="signInWrapper">
                                <button type="submit" className="signIn">Sign In</button>
                            </div>
                        </form>
                        <div className="footer-div">
                            <div className="register-footer">
                                Don’t have an account?{' '}
                                <span className="link" onClick={() => setActiveTab("tab1")}>
                  Sign up here
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
