const db = require("../config/db");

/* ===============================
   ADD SAVINGS
================================ */
exports.addSavings = async (req, res) => {
  try {
    const { title, amount, savings_date } = req.body;
    const userId = req.user.id; // ✅ FIX

    if (!title || !amount || !savings_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    await db.query(
      `INSERT INTO savings (user_id, title, amount, savings_date)
       VALUES (?, ?, ?, ?)`,
      [userId, title, amount, savings_date]
    );

    return res.status(201).json({
      message: "Savings added successfully"
    });

  } catch (err) {
    console.error("ADD SAVINGS ERROR:", err);
    return res.status(500).json({ message: "DB error" });
  }
};


/* ===============================
   LIST SAVINGS
================================ */
exports.listSavings = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIX

    const [rows] = await db.query(
      `SELECT * FROM savings
       WHERE user_id = ?
       ORDER BY savings_date DESC`,
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error("LIST SAVINGS ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};


/* ===============================
   SAVINGS BY DATE
================================ */
exports.savingsByDate = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIX
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const [rows] = await db.query(
      `SELECT * FROM savings
       WHERE user_id = ? AND savings_date = ?`,
      [userId, date]
    );

    res.json(rows);

  } catch (err) {
    console.error("SAVINGS BY DATE ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};


/* ===============================
   UPDATE SAVINGS
================================ */
exports.updateSavings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // ✅ FIX
    const { title, amount, savings_date } = req.body;

    const [result] = await db.query(
      `UPDATE savings
       SET title = ?, amount = ?, savings_date = ?
       WHERE id = ? AND user_id = ?`,
      [title, amount, savings_date, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Savings updated" });

  } catch (err) {
    console.error("UPDATE SAVINGS ERROR:", err);
    res.status(500).json({ message: "DB error" });
  }
};
