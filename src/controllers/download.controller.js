const ExcelJS = require("exceljs");
const db = require("../config/db");

// Month name → month number map
const MONTH_MAP = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12
};
// ======================
// 🎨 EXCEL STYLING HELPERS
// ======================
function styleHeader(row) {
  row.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF6FF" }
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  });
}

function autoWidth(worksheet) {
  worksheet.columns.forEach(col => {
    let max = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      max = Math.max(max, len);
    });
    col.width = max + 2;
  });
}
exports.downloadExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Year required" });
    }

    const isAllMonths = !month || month === "ALL";
    const monthNumber = MONTH_MAP[month]; // undefined if ALL

    if (!isAllMonths && !monthNumber) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // Dynamic SQL helpers
    const monthFilter = isAllMonths ? "" : "AND MONTH(%DATE%) = ?";
    const params = isAllMonths
      ? [userId, year]
      : [userId, year, monthNumber];

    const workbook = new ExcelJS.Workbook();

    /* ======================
       SUMMARY
    ====================== */
    const summary = workbook.addWorksheet("Summary");
    summary.addRow(["Metric", "Amount"]);

    const [[inc]] = await db.query(
      `
      SELECT SUM(amount) total
      FROM income
      WHERE user_id=?
        AND YEAR(income_date)=?
        ${monthFilter.replace("%DATE%", "income_date")}
      `,
      params
    );

    const [[exp]] = await db.query(
      `
      SELECT SUM(amount) total
      FROM expenses
      WHERE user_id=?
        AND YEAR(expense_date)=?
        ${monthFilter.replace("%DATE%", "expense_date")}
      `,
      params
    );

    const [[sav]] = await db.query(
      `
      SELECT SUM(amount) total
      FROM savings
      WHERE user_id=?
        AND YEAR(savings_date)=?
        ${monthFilter.replace("%DATE%", "savings_date")}
      `,
      params
    );

    summary.addRows([


      ["Total Income", inc.total || 0],
      ["Total Expenses", exp.total || 0],
      ["Total Savings", sav.total || 0],
      ["Net Balance", (inc.total || 0) - (exp.total || 0) - (sav.total || 0)]
      
    ]);

    /* ======================
       INCOME
    ====================== */
    const incomeSheet = workbook.addWorksheet("Income");
    incomeSheet.addRow(["Title", "Date", "Amount"]);

    const [incomeRows] = await db.query(
      `
      SELECT title, income_date, amount
      FROM income
      WHERE user_id=?
        AND YEAR(income_date)=?
        ${monthFilter.replace("%DATE%", "income_date")}
      `,
      params
    );

    incomeRows.forEach(r =>
      incomeSheet.addRow([r.title, r.income_date, r.amount])
    );

    /* ======================
       EXPENSES
    ====================== */
    const expensesSheet = workbook.addWorksheet("Expenses");
    expensesSheet.addRow(["Title", "Date", "Payment Mode", "Amount"]);

    const [expenseRows] = await db.query(
      `
      SELECT title, expense_date, payment_mode, amount
      FROM expenses
      WHERE user_id=?
        AND YEAR(expense_date)=?
        ${monthFilter.replace("%DATE%", "expense_date")}
      `,
      params
    );

    expenseRows.forEach(r =>
      expensesSheet.addRow([
        r.title,
        r.expense_date,
        r.payment_mode,
        r.amount
      ])
    );

    /* ======================
       SAVINGS
    ====================== */
    const savingsSheet = workbook.addWorksheet("Savings");
    savingsSheet.addRow(["Title", "Date", "Amount"]);

    const [savingRows] = await db.query(
      `
      SELECT title, savings_date, amount
      FROM savings
      WHERE user_id=?
        AND YEAR(savings_date)=?
        ${monthFilter.replace("%DATE%", "savings_date")}
      `,
      params
    );

    savingRows.forEach(r =>
      savingsSheet.addRow([r.title, r.savings_date, r.amount])
    );

    /* ======================
       DOWNLOAD
    ====================== */
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=BSH_Finance_${year}_${month || "ALL"}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).json({ message: "Download failed" });
  }
};
