let monthlyOverviewChart = null;
let netTrendChart = null;

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ==============================
// LOAD REPORTS (MAIN)
// ==============================
async function loadReports(year) {
  try {
    const [income, expenses, savings] = await Promise.all([
      apiFetch("/api/income"),
      apiFetch("/api/expenses"),
      apiFetch("/api/savings")
    ]);

    const monthlyData = buildMonthlyData(year, income, expenses, savings);

    renderMonthlyOverviewChart(monthlyData);
    renderNetTrendChart(monthlyData);

  } catch (err) {
    console.error("❌ Reports load failed", err);
  }
}

document.getElementById("downloadExcelBtn")
  ?.addEventListener("click", () => {

    const year = document.getElementById("downloadYear").value;
    const month = document.getElementById("downloadMonth").value;

    const token = localStorage.getItem("bsh_token");

    const url =
      `/api/download/excel?year=${year}&month=${month}&token=${token}`;

    // 🔥 Browser handles file download
    window.location.href = url;
});

// ==============================
// BUILD MONTHLY DATA
// ==============================
function buildMonthlyData(year, income, expenses, savings) {
  const data = MONTHS.map(() => ({
    income: 0,
    expenses: 0,
    savings: 0,
    net: 0
  }));

  income.forEach(i => {
    const d = new Date(i.income_date);
    if (d.getFullYear() === year) {
      data[d.getMonth()].income += Number(i.amount || 0);
    }
  });

  expenses.forEach(e => {
    const d = new Date(e.expense_date || e.date);
    if (d.getFullYear() === year) {
      data[d.getMonth()].expenses += Number(e.amount || 0);
    }
  });

  savings.forEach(s => {
    const d = new Date(s.savings_date);
    if (d.getFullYear() === year) {
      data[d.getMonth()].savings += Number(s.amount || 0);
    }
  });

  data.forEach(m => {
    m.net = m.income - m.expenses - m.savings;
  });

  return data;
}

// ==============================
// MONTHLY OVERVIEW CHART
// ==============================
function renderMonthlyOverviewChart(data) {
  const canvas = document.getElementById("monthlyOverviewChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (monthlyOverviewChart) {
    monthlyOverviewChart.destroy();
  }

  monthlyOverviewChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: "Income",
          data: data.map(m => m.income)
        },
        {
          label: "Expenses",
          data: data.map(m => m.expenses)
        },
        {
          label: "Savings",
          data: data.map(m => m.savings)
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      }
    }
  });
}

// ==============================
// NET TREND CHART
// ==============================
function renderNetTrendChart(data) {
  const canvas = document.getElementById("netTrendChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (netTrendChart) {
    netTrendChart.destroy();
  }

  netTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: "Net Balance",
          data: data.map(m => m.net),
          tension: 0.35,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" }
      }
    }
  });
}
