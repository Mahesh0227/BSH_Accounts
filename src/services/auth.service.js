const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.adminSignupOnce = async ({ name, email, password }) => {
  const [rows] = await db.query(
    "SELECT id FROM users WHERE role = 'SUPER_ADMIN'"
  );

  if (rows.length > 0) {
    throw new Error("Super admin already exists");
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, 'SUPER_ADMIN')`,
    [name, email, hashed]
  );
};
