const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // 👈 Agregás CORS
const app = express();
const PORT = 3000;


app.use(cors());

require('./routes/mqttService')
const authRoutes = require('./routes/authRoutes');
const seatsRoutes = require('./routes/seatRoutes');

app.use(bodyParser.json());
app.use('/api', authRoutes);
app.use('/api', seatsRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express corriendo en http://0.0.0.0:${PORT}`);
});
