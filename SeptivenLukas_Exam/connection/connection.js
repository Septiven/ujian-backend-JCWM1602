const mysql = require('mysql')

// Connection
const db = mysql.createConnection({
    user: 'root',
    password: 'Lukas',
    database: 'backend_2021',
    port: 3306
})

module.exports = db