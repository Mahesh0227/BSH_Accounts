const db = require('../config/db');

//
// ======================= EXPENSES DASHBOARD =======================
//

// 1️⃣ TODAY EXPENSES TOTAL
exports.todayTotal = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM expenses
    WHERE user_id = ?
      AND expense_date = CURDATE()
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('TODAY EXPENSE ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ todayTotal: results[0].total });
  });
};

// 2️⃣ CURRENT MONTH EXPENSE TOTAL
exports.monthTotal = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM expenses
    WHERE user_id = ?
      AND MONTH(expense_date) = MONTH(CURDATE())
      AND YEAR(expense_date) = YEAR(CURDATE())
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('MONTH EXPENSE ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ monthTotal: results[0].total });
  });
};

// 3️⃣ MONTHLY EXPENSES (CHART)
exports.monthExpenses = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT expense_date, SUM(amount) AS total
    FROM expenses
    WHERE user_id = ?
      AND MONTH(expense_date) = MONTH(CURDATE())
      AND YEAR(expense_date) = YEAR(CURDATE())
    GROUP BY expense_date
    ORDER BY expense_date
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('EXPENSE CHART ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json(results);
  });
};


//
// ======================= INCOME DASHBOARD =======================
//

// 4️⃣ TODAY INCOME TOTAL
exports.todayIncome = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM income
    WHERE user_id = ?
      AND income_date = CURDATE()
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('TODAY INCOME ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ todayIncome: results[0].total });
  });
};

// 5️⃣ CURRENT MONTH INCOME TOTAL
exports.monthIncome = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM income
    WHERE user_id = ?
      AND MONTH(income_date) = MONTH(CURDATE())
      AND YEAR(income_date) = YEAR(CURDATE())
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('MONTH INCOME ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ monthIncome: results[0].total });
  });
};

// 6️⃣ MONTHLY INCOME (CHART)
exports.incomeChart = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT income_date, SUM(amount) AS total
    FROM income
    WHERE user_id = ?
      AND MONTH(income_date) = MONTH(CURDATE())
      AND YEAR(income_date) = YEAR(CURDATE())
    GROUP BY income_date
    ORDER BY income_date
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('INCOME CHART ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json(results);
  });
};


//
// ======================= SAVINGS DASHBOARD =======================
//

// 7️⃣ TODAY SAVINGS TOTAL
exports.todaySavings = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM savings
    WHERE user_id = ?
      AND savings_date = CURDATE()
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('TODAY SAVINGS ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ todaySavings: results[0].total });
  });
};

// 8️⃣ CURRENT MONTH SAVINGS TOTAL
exports.monthSavings = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT IFNULL(SUM(amount), 0) AS total
    FROM savings
    WHERE user_id = ?
      AND MONTH(savings_date) = MONTH(CURDATE())
      AND YEAR(savings_date) = YEAR(CURDATE())
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('MONTH SAVINGS ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json({ monthSavings: results[0].total });
  });
};

// 9️⃣ MONTHLY SAVINGS (CHART)
exports.savingsChart = (req, res) => {
  const userId = req.userId;

  const sql = `
    SELECT savings_date, SUM(amount) AS total
    FROM savings
    WHERE user_id = ?
      AND MONTH(savings_date) = MONTH(CURDATE())
      AND YEAR(savings_date) = YEAR(CURDATE())
    GROUP BY savings_date
    ORDER BY savings_date
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('SAVINGS CHART ERROR:', err);
      return res.status(500).json({ message: 'DB error' });
    }
    res.json(results);
  });
};


