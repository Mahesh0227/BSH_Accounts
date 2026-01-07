const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1216",
  database: "bsh_demo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔥 THIS FIX MAKES await WORK
module.exports = db.promise();
