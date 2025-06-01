import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Home from './components/Home';
import Reservar from './components/Reservar';
import Perfil from './components/Perfil';
import MisReservas from './components/MisReservas';




function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/misreservas" element={<MisReservas />} />
        </Routes>
      </Router>
  );
}

export default App;
