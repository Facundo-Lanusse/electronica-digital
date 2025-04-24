const mqtt = require('mqtt');
const db = require('../dataBase')

// conexión al broker mqtt con mi ip elastica publica
const mqttClient = mqtt.connect('mqtt://100.28.15.22:1883')

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
    const parts = topic.split('/');
    const asiento = parseInt(parts[2]); // ejemplo: sensor/asiento/3
    const ocupado = message.toString() === '1'; // '1' => true; '0' => false

    try {
        await db.query(
            'UPDATE seat SET is_occupied = $1 WHERE seat_number = $2',
            [ocupado, asiento]
        );
        console.log(`Asiento ${asiento} actualizado a ${ocupado ? 'Ocupado' : 'Libre'}`);
    } catch (err) {
        console.error('Error al actualizar asiento:', err);
    }
});