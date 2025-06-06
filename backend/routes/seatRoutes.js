//routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dataBase');
const mqttClient = require('../routes/mqttService');
const { authMiddleware } = require('./authRoutes');

// Consigue el asiento por id
router.get('/seats/:trainId', async (req, res) => {
    const { trainId } = req.params;

    try {
        // Consulta que incluye información de reserva
        const result = await db.query(
            `SELECT s.id, s.seat_number, s.railcar_number, s.is_occupied,
                    r.user_id as reserved_by
             FROM seat s
             LEFT JOIN reservation r ON s.id = r.seat_id AND r.status = 'active'
             WHERE s.train_id = $1
             ORDER BY s.railcar_number, s.seat_number`,
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

// Ruta protegida para reservar asiento
router.post('/seats/reserve', authMiddleware, async (req, res) => {
    const { trainId, railcarNumber, seatNumber } = req.body;
    const userId = req.user.userId; // Obtenemos el userId del token JWT

    console.log('Datos de reserva:', req.body, 'Usuario:', userId);

    try {
        // Inicia una transacción para asegurar consistencia de datos
        await db.query('BEGIN');

        // Obtener el ID del asiento
        const seatResult = await db.query(
            'SELECT id, is_occupied FROM seat WHERE train_id = $1 AND railcar_number = $2 AND seat_number = $3',
            [trainId, railcarNumber, seatNumber.toString()]
        );

        if (seatResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Asiento no encontrado' });
        }

        const seat = seatResult.rows[0];

        if (seat.is_occupied) {
            await db.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'El asiento está ocupado' });
        }

        // Verificar si ya existe una reserva activa para este asiento
        const reservationCheck = await db.query(
            'SELECT id FROM reservation WHERE seat_id = $1 AND status = $2',
            [seat.id, 'active']
        );

        if (reservationCheck.rows.length > 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'El asiento ya está reservado' });
        }

        // Crear la reserva incluyendo reservation_date y time explícitamente
        const now = new Date();
        await db.query(
            'INSERT INTO reservation (user_id, seat_id, status, reservation_date, reservation_time) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [userId, seat.id, 'active']
        );

        // Confirmar la transacción
        await db.query('COMMIT');

        // Publicar en MQTT para encender el LED
        const topic = `train/${trainId}/seat/${railcarNumber}-${seatNumber}/reserve`;
        mqttClient.publish(topic, 'true');

        res.json({ success: true, message: `Asiento ${seatNumber} reservado correctamente` });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error al reservar asiento:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

router.post('/seats/cancel', authMiddleware, async (req, res) => {
    const { trainId, railcarNumber, seatNumber } = req.body;
    const userId = req.user.userId; // Obtenemos el userId del token JWT

    try {
        // Inicia una transacción
        await db.query('BEGIN');

        // Obtener el ID del asiento
        const seatResult = await db.query(
            'SELECT id FROM seat WHERE train_id = $1 AND railcar_number = $2 AND seat_number = $3',
            [trainId, railcarNumber, seatNumber.toString()]
        );

        if (seatResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Asiento no encontrado' });
        }

        const seatId = seatResult.rows[0].id;

        // Verificar si el asiento está reservado por el usuario
        const reservationResult = await db.query(
            'SELECT id FROM reservation WHERE seat_id = $1 AND user_id = $2 AND status = $3',
            [seatId, userId, 'active']
        );

        if (reservationResult.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'El asiento no está reservado por este usuario' });
        }

        // Cambiar el estado de la reserva a cancelado
        await db.query(
            'UPDATE reservation SET status = $1 WHERE id = $2',
            ['cancelled', reservationResult.rows[0].id]
        );

        // Actualizar la tabla seat para quitar la reserva (reserved_by = NULL)
        await db.query(
            'UPDATE seat SET reserved_by = NULL WHERE id = $1',
            [seatId]
        );

        // Confirmar la transacción
        await db.query('COMMIT');

        // Publicar en MQTT para apagar el LED
        const topic = `train/${trainId}/seat/${railcarNumber}-${seatNumber}/reserve`;
        mqttClient.publish(topic, 'false');

        res.json({ success: true, message: 'Reserva cancelada correctamente' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error al cancelar reserva:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Nueva ruta para obtener todas las reservas del usuario autenticado
router.get('/reservations/my', authMiddleware, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await db.query(
            `SELECT r.id, r.reservation_date, r.status,
                    s.train_id, s.railcar_number, s.seat_number, s.is_occupied
             FROM reservation r
             JOIN seat s ON r.seat_id = s.id
             WHERE r.user_id = $1
             ORDER BY r.reservation_date DESC`,
            [userId]
        );

        res.json({
            success: true,
            reservations: result.rows
        });
    } catch (err) {
        console.error('Error al obtener reservas:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para obtener el historial de reservas (solo para admins, se podría implementar después)
router.get('/reservations/:userId', authMiddleware, async (req, res) => {
    // Aquí se podría verificar que el usuario es admin
    // if (!req.user.isAdmin) return res.status(403).json({...});

    const { userId } = req.params;

    try {
        const result = await db.query(
            `SELECT r.id, r.reservation_date, r.status,
                    s.train_id, s.railcar_number, s.seat_number, s.is_occupied
             FROM reservation r
             JOIN seat s ON r.seat_id = s.id
             WHERE r.user_id = $1
             ORDER BY r.reservation_date DESC`,
            [userId]
        );

        res.json({
            success: true,
            reservations: result.rows
        });
    } catch (err) {
        console.error('Error al obtener reservas:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;
