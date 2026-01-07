const db = require("../config/db");

// ADD
exports.addIncome = async (req, res) => {
  try {
    const { title, source, amount, income_date } = req.body;
    const incomeTitle = title || source;

    if (!incomeTitle || !amount) {
      return res.status(400).json({ message: "Title and amount required" });
    }

    await db.query(
      `INSERT INTO income (title, amount, income_date, user_id)
       VALUES (?, ?, ?, ?)`,
      [incomeTitle, amount, income_date, req.user.id]
    );

    res.status(201).json({ message: "Income added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add income" });
  }
};

// LIST
exports.listIncome = async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM income WHERE user_id=? ORDER BY income_date DESC",
    [req.user.id]
  );
  res.json(rows);
};

// DELETE
exports.deleteIncome = async (req, res) => {
  const { id } = req.params;

  const [r] = await db.query(
    "DELETE FROM income WHERE id=? AND user_id=?",
    [id, req.user.id]
  );

  if (r.affectedRows === 0)
    return res.status(404).json({ message: "Not found" });

  res.json({ message: "Income deleted" });
};

// UPDATE
exports.updateIncome = async (req, res) => {
  const { id } = req.params;
  const { title, amount, income_date } = req.body;

  const [r] = await db.query(
    `UPDATE income SET title=?, amount=?, income_date=?
     WHERE id=? AND user_id=?`,
    [title, amount, income_date, id, req.user.id]
  );

  if (r.affectedRows === 0)
    return res.status(404).json({ message: "Not found" });

  res.json({ message: "Income updated" });
};

// BY DATE
exports.incomeByDate = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date required" });

  const [rows] = await db.query(
    "SELECT * FROM income WHERE user_id=? AND income_date=?",
    [req.user.id, date]
  );

  res.json(rows);
};
