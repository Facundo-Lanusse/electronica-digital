const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg')
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json());

//Rutas
app.use('/api', require('/routes/authRoutes'));
app.use('/api', require('/routes/mqttConfig'));

app.listen(3000, () => {
    console.log(`Servidor corriendo en http://localhost:3000`);
});