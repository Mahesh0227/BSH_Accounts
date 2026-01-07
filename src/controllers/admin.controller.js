const db = require("../config/db");
const bcrypt = require("bcrypt");
// ================= TEMP PASSWORD GENERATOR =================
function generateTempPassword(length = 8) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}
// ================= CREATE USER =================
exports.createUser = async (req, res) => {
  try {
    // 🔐 Role check
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔍 Check existing user
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔑 GENERATE TEMP PASSWORD
    const tempPassword = generateTempPassword();

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 💾 SAVE USER
    await db.query(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [name, email, hashedPassword, role]
    );

    // ✅ SEND TEMP PASSWORD TO FRONTEND
    res.json({
      message: "User created successfully",
      tempPassword
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Create user failed" });
  }
};

// ================= LIST USERS =================
exports.listUsers = async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await db.query(
      `SELECT id, name, email, role, is_active, last_login_at
       FROM users`
    );

    res.json(rows);

  } catch (err) {
    console.error("LIST USERS ERROR:", err);
    res.status(500).json({ message: "Failed to load users" });
  }
};

// ================= DELETE USER =================
exports.deleteUser = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // ❌ Prevent deleting self
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    await conn.beginTransaction();

    // 🔥 DELETE CHILD RECORDS FIRST
    await conn.query("DELETE FROM expenses WHERE user_id = ?", [id]);
    await conn.query("DELETE FROM income WHERE user_id = ?", [id]);
    await conn.query("DELETE FROM savings WHERE user_id = ?", [id]);
    await conn.query("DELETE FROM password_resets WHERE user_id = ?", [id]);

    // 🔥 DELETE USER LAST
    const [result] = await conn.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    await conn.commit();

    res.json({ message: "User permanently deleted" });

  } catch (err) {
    await conn.rollback();
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

// ================= PAUSE USER =================
exports.pauseUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE users SET is_active = 0 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User paused successfully" });

  } catch (err) {
    console.error("Pause user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RESUME USER =================
exports.resumeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE users SET is_active = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User resumed successfully" });

  } catch (err) {
    console.error("Resume user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
