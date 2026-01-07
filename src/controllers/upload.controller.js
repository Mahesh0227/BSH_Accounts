const ExcelJS = require("exceljs");
const db = require("../config/db");

exports.uploadExcel = async (req, res) => {
  try {
    const userId = req.userId;

    // ✅ FILE CHECK
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    let inserted = {
      income: 0,
      expenses: 0,
      savings: 0
    };

    /* ================= INCOME ================= */
    const incomeSheet = workbook.getWorksheet("Income");
    if (incomeSheet) {
      incomeSheet.eachRow((row, i) => {
        if (i === 1) return;

        const [title, date, amount] = row.values.slice(1);
        if (!title || !date || !amount) return;

        db.query(
          `INSERT INTO income (user_id, title, income_date, amount)
           VALUES (?, ?, ?, ?)`,
          [userId, title, date, amount]
        );
        inserted.income++;
      });
    }

    /* ================= EXPENSES ================= */
    const expenseSheet = workbook.getWorksheet("Expenses");
    if (expenseSheet) {
      expenseSheet.eachRow((row, i) => {
        if (i === 1) return;

        const [title, date, payment, amount] = row.values.slice(1);
        if (!title || !date || !amount) return;

        db.query(
          `INSERT INTO expenses
           (user_id, title, expense_date, payment_mode, amount)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, title, date, payment || "Cash", amount]
        );
        inserted.expenses++;
      });
    }

    /* ================= SAVINGS ================= */
    const savingsSheet = workbook.getWorksheet("Savings");
    if (savingsSheet) {
      savingsSheet.eachRow((row, i) => {
        if (i === 1) return;

        const [title, date, amount] = row.values.slice(1);
        if (!title || !date || !amount) return;

        db.query(
          `INSERT INTO savings (user_id, title, savings_date, amount)
           VALUES (?, ?, ?, ?)`,
          [userId, title, date, amount]
        );
        inserted.savings++;
      });
    }

    res.json({
      message: "Excel uploaded successfully",
      inserted
    });

  } catch (err) {
    console.error("Excel upload failed:", err);
    res.status(500).json({ message: "Excel upload failed" });
  }
};
