const { Pool } = require('pg');

// Configuración de PostgreSQL (IP privada de la instancia)
const dataBase = new Pool({
    host: '172.31.34.58',          // IP privada de tu instancia PostgreSQL
    port: 5432,
    user: 'electronica_user',
    password: 'electro123', // electronica2025
    database: 'electronica'
});

module.exports = dataBase;