const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3001;

// ⚠️ Configurar CORS correctamente
app.use(cors({
    origin: 'http://100.28.15.22:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // maneja preflight requests

require('./routes/mqttService');
const authRoutes = require('./routes/authRoutes');
const seatsRoutes = require('./routes/seatRoutes');

app.use(bodyParser.json());
app.use('/api', authRoutes);
app.use('/api', seatsRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express corriendo en http://0.0.0.0:${PORT}`);
});
