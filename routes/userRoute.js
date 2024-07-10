// postgres connection start
const { Pool } = require('pg');
const { DB_HOST2, DB_USERNAME2, DB_PASSWORD2, DB_NAME2, PORT2 } = process.env;
const pool = new Pool({
    user: DB_USERNAME2,
    host: DB_HOST2,
    database: DB_NAME2,
    password: DB_PASSWORD2,
    port: PORT2
});

// Connect to PostgreSQL
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Error connecting to PostgreSQL', err));
// postgres connection end

module.exports = {pool};

// postgres code end