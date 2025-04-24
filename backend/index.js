const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg')
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json());

// conexión al broker mqtt con mi ip elastica publica
const mqttClient = mqtt.connect('mqtt://100.28.15.22:1883')

// Configuración de PostgreSQL (IP privada de la instancia)
const db = new Pool({
    host: '172.31.34.58',          // IP privada de tu instancia PostgreSQL
    port: 5432,
    user: 'electronica_user',
    password: 'electro123',
    database: 'electronica'
});

// Cuando se conecta al broker MQTT
mqttClient.on('connect', () => {
    console.log('Conectado al broker MQTT');

    // Escuchar todos los sensores
    mqttClient.subscribe('sensor/asiento/#', (err) => {
        if (!err) {
            console.log('Subscrito a sensor/asiento/#');
        } else {
            console.error('Error en la subscripción:', err);
        }
    });
});

// Mensajes del ESP32
mqttClient.on('message', async (topic, message) => {
    const asiento = topic.split('/')[2]; // ejemplo: sensor/asiento/3
    const ocupado = message.toString() === '1';

    try {
        await db.query(
            'UPDATE asientos SET ocupado = $1 WHERE numero = $2',
            [ocupado, asiento]
        );
        console.log(`Asiento ${asiento} actualizado a ${ocupado ? 'Ocupado' : 'Libre'}`);
    } catch (err) {
        console.error('Error al actualizar asiento:', err);
    }
});

// GET básico
app.get('/', (req, res) => {
    res.send('Express + MQTT + PostgreSQL funcionando');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
