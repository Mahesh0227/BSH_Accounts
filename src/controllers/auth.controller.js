const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ FIXED FIELD NAME
    await db.query(
      "UPDATE users SET last_login_at = NOW() WHERE id = ?",
      [user.id]
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ================= ONE-TIME ADMIN SIGNUP =================
exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    await authService.adminSignupOnce({ name, email, password });

    res.status(201).json({
      message: "Super Admin created successfully"
    });

  } catch (err) {
    return res.status(403).json({
      message: err.message || "Super admin already exists"
    });
  }
};


// ================= REGISTER (NORMAL USER) =================
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, 'USER')",
      [email, hashed]
    );

    res.status(201).json({ message: "Registered successfully" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ================= CHANGE PASSWORD =================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // JWT middleware nundi
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, userId]
    );

    res.json({ message: "✅ Password changed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
