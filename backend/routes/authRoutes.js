// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dataBase'); // conexión correcta a PostgreSQL
const bcrypt = require('bcrypt')

// Corregir el login para usar password_hash y bcrypt.compare
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM "user" WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log(...user);
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                res.json({ success: true, message: 'Login exitoso', user: {...user, password_hash: undefined} });
            } else {
                res.status(401).json({ success: false, message: 'Credenciales inválidas' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Recibí POST /signup con:', name, email); // LOG 1

    try {
        // Hashear y crear nuevo usuario
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            'INSERT INTO "user" (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, registered_at',
            [name, email, passwordHash]
        )
        console.log('Usuario creado en DB'); // LOG 2
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creando usuario:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
})

module.exports = router;