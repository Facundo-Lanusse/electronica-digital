// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dataBase'); // conexión correcta a PostgreSQL
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secreto para JWT - idealmente esto debería estar en variables de entorno
const JWT_SECRET = 'tu_secreto_super_seguro'; // En producción usar process.env.JWT_SECRET

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
            console.log(user);
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                // Crear token JWT
                const token = jwt.sign(
                    {
                        userId: user.id,
                        email: user.email
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' } // Token expira en 24 horas
                );

                res.json({
                    success: true,
                    message: 'Login exitoso',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    } });
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
            'INSERT INTO "user" (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, passwordHash]
        );

        console.log('Usuario creado:', result.rows[0]); // LOG 2

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);

        // Manejar error de duplicación de email
        if (error.code === '23505') { // Código de PostgreSQL para unique_violation
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado',
                error: error.detail
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
});

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// Ruta protegida de ejemplo
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email FROM "user" WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Middleware para verificar token - versión exportable para otras rutas
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = {
    router,
    authMiddleware  // Exportamos el middleware para usarlo en otras rutas
};
