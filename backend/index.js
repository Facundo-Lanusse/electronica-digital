const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Configurar CORS correctamente
app.use(cors());

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
