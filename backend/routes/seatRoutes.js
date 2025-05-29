//routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dataBase');
const mqttClient = require('../routes/mqttService');

// Consigue el asiento por id
router.get('/seats/:trainId', async (req, res) => {
    const { trainId } = req.params;

    try {
        // Hago la consulta en la base de datos para obtener tren por id
        const result = await db.query(
            'SELECT seat_number, railcar_number, is_occupied, reserved_by ' +
            'FROM seat ' +
            'WHERE train_id = $1 ' +
            'ORDER BY railcar_number, seat_number',
            [trainId]
        );
        res.json({
            success: true,
            seats: result.rows
        });
    } catch (err) {
        console.error('Error al consultar asientos:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

router.post('/seats/reserve', async (req, res) => {
    const { trainId, railcarNumber, seatNumber, userId } = req.body;

    try {
        // Verificar si el asiento está ocupado o ya reservado
        const checkResult = await db.query(
            'SELECT is_occupied, reserved_by FROM seat WHERE train_id = $1 AND railcar_number = $2 AND seat_number = $3',
            [trainId, railcarNumber, seatNumber.toString()]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Asiento no encontrado' });
        }

        const seat = checkResult.rows[0];
        if (seat.is_occupied) {
            return res.status(400).json({ success: false, message: 'El asiento está ocupado' });
        }

        if (seat.reserved_by !== null) {
            return res.status(400).json({ success: false, message: 'El asiento ya está reservado' });
        }

        // Reservar el asiento (reserved_by es ahora INTEGER)
        await db.query(
            'UPDATE seat SET reserved_by = $1 WHERE train_id = $2 AND railcar_number = $3 AND seat_number = $4',
            [userId, trainId, railcarNumber, seatNumber.toString()]
        );

        // Publicar en MQTT para encender el LED
        const topic = `train/${trainId}/seat/${railcarNumber}-${seatNumber}/reserve`;
        mqttClient.publish(topic, 'true');

        res.json({ success: true, message: `Asiento ${seatNumber} reservado correctamente por ${userId}` });
    } catch (err) {
        console.error('Error al reservar asiento:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

router.post('/seats/cancel', async (req, res) => {
    const { trainId, railcarNumber, seatNumber, userId } = req.body;

    try {
        // Verificar si el asiento está reservado por el usuario
        const checkResult = await db.query(
            'SELECT reserved_by FROM seat WHERE train_id = $1 AND railcar_number = $2 AND seat_number = $3',
            [trainId, railcarNumber, seatNumber.toString()]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Asiento no encontrado' });
        }

        const seat = checkResult.rows[0];
        if (seat.reserved_by !== userId) {
            return res.status(400).json({ success: false, message: 'El asiento no está reservado por este usuario' });
        }

        await db.query(
            'UPDATE seat SET reserved_by = NULL WHERE train_id = $1 AND railcar_number = $2 AND seat_number = $3',
            [trainId, railcarNumber, seatNumber.toString()]
        );

        // Publicar en MQTT para apagar el LED
        const topic = `train/${trainId}/seat/${railcarNumber}-${seatNumber}/reserve`;
        mqttClient.publish(topic, 'false');

        res.json({ success: true, message: 'Reserva cancelada correctamente' });
    } catch (err) {
        console.error('Error al cancelar reserva:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;
