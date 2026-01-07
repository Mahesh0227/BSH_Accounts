const db = require("../config/db");

/* ===============================
   ADD EXPENSE (WITH FILES)
================================ */
exports.addExpense = async (req, res) => {
  try {
    const { title, expense_date, payment_mode, amount } = req.body;
    const userId = req.user.id; // ✅ FIX

    if (!title || !expense_date || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const bill = req.files?.bill?.[0]?.filename || null;
    const warranty = req.files?.warranty?.[0]?.filename || null;

    await db.query(
      `INSERT INTO expenses
       (user_id, title, expense_date, payment_mode, amount, bill_file, warranty_file)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        expense_date,
        payment_mode || null,
        amount,
        bill,
        warranty
      ]
    );

    res.json({ message: "Expense added" });

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};


/* ===============================
   LIST EXPENSES
================================ */
exports.listExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIX

    const [rows] = await db.query(
      `SELECT
         id,
         title,
         expense_date,
         payment_mode,
         amount,
         bill_file,
         warranty_file
       FROM expenses
       WHERE user_id = ?
       ORDER BY expense_date DESC`,
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error("LIST EXPENSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};


/* ===============================
   DELETE EXPENSE
================================ */
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIX
    const { id } = req.params;

    const [result] = await db.query(
      `DELETE FROM expenses WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });

  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};


/* ===============================
   UPDATE EXPENSE (OPTIONAL FILES)
================================ */
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ FIX
    const { id } = req.params;

    const { title, amount, expense_date, payment_mode } = req.body;

    if (!title || !amount || !expense_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const billFile = req.files?.bill?.[0];
    const warrantyFile = req.files?.warranty?.[0];

    const [[existing]] = await db.query(
      `SELECT bill_file, warranty_file
       FROM expenses
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const billName = billFile ? billFile.filename : existing.bill_file;
    const warrantyName = warrantyFile ? warrantyFile.filename : existing.warranty_file;

    await db.query(
      `UPDATE expenses
       SET title = ?, amount = ?, expense_date = ?, payment_mode = ?,
           bill_file = ?, warranty_file = ?
       WHERE id = ? AND user_id = ?`,
      [
        title,
        amount,
        expense_date,
        payment_mode || null,
        billName,
        warrantyName,
        id,
        userId
      ]
    );

    res.json({ message: "Expense updated successfully" });

  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err);
    res.status(500).json({ message: "Failed to update expense" });
  }
};
