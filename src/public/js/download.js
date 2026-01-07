// ==============================
// DOWNLOAD EXCEL (YEAR + MONTH)
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadExcelBtn");
  const downloadYear = document.getElementById("downloadYear");
  const downloadMonth = document.getElementById("downloadMonth");
//  const token = localStorage.getItem("bsh_token");
  // ------------------------------
  // INIT YEAR DROPDOWN (AUTO)
  // ------------------------------
  (function initDownloadYears() {
    if (!downloadYear) return;

    const currentYear = new Date().getFullYear();
    downloadYear.innerHTML = "";

    for (let y = currentYear; y >= 2020; y--) {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      downloadYear.appendChild(opt);
    }

    downloadYear.value = currentYear;
  })();

  // ------------------------------
  // DOWNLOAD HANDLER
  // ------------------------------


  downloadBtn.addEventListener("click", async () => {
    const year = downloadYear.value;
    const month = downloadMonth.value || "ALL";
    const token = localStorage.getItem("bsh_token");

    if (!token) {
      alert("Please login again");
      return;
    }

    try {
      // 🔐 Authenticated request
      const res = await fetch(
        `/api/download/excel?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Download failed");
      }

      // 📦 Convert response to file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // ⬇ Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `BSH_Finance_${year}_${month}.xlsx`;
      document.body.appendChild(a);
      a.click();

      // 🧹 Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download Excel file");
    }
  });
});
