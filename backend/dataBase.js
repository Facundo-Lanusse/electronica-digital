const { Pool } = require('pg');

// Configuración de PostgreSQL (IP privada de la instancia)
const dataBase = new Pool({
    host: process.env.DB_HOST,          // IP privada de tu instancia PostgreSQL
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // electronica2025 || electro123
    database: process.env.DB_NAME,
});

module.exports = dataBase;