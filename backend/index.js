require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Configurar CORS correctamente
app.use(cors());

app.options('*', cors()); // maneja preflight requests

require('./routes/mqttService');
const { router: authRouter, authMiddleware } = require('./routes/authRoutes');
const seatsRoutes = require('./routes/seatRoutes');

app.use(bodyParser.json());
app.use('/api', authRouter);
app.use('/api', seatsRoutes);

// Ruta protegida de ejemplo
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Esta es una ruta protegida', user: req.user });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express corriendo en http://0.0.0.0:${PORT}`);
});
