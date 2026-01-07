/* ===============================
   CREATE USER – ADMIN PANEL
================================ */
const modal = document.getElementById("create-user-modal");
const openBtn = document.getElementById("open-create-modal");
const closeX = document.getElementById("close-modal-x");
const closeCancel = document.getElementById("close-modal-cancel");

const createUserBtn = document.getElementById("createUserBtn");

const tempPasswordBox = document.getElementById("tempPasswordBox");
const tempPasswordInput = document.getElementById("tempPasswordInput");
const copyBtn = document.getElementById("copyTempPassword");

// ---------------- OPEN MODAL ----------------
openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  resetTempPasswordUI();
});

// ---------------- CLOSE MODAL ----------------
function closeModal() {
  modal.style.display = "none";
  resetTempPasswordUI();
}

closeX.addEventListener("click", closeModal);
closeCancel.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// ---------------- RESET TEMP PASSWORD UI ----------------
function resetTempPasswordUI() {
  tempPasswordBox.style.display = "none";
  tempPasswordInput.value = "";
  copyBtn.textContent = "Copy";
}

// ---------------- CREATE USER ----------------
createUserBtn.addEventListener("click", async () => {
  const email = document.getElementById("user-email").value.trim();
  const name = document.getElementById("user-name").value.trim();
  const role = document.getElementById("user-role").value;

  if (!email || !name || !role) {
    alert("All fields required");
    return;
  }

  const token = localStorage.getItem("bsh_token");
  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "/";
    return;
  }

  createUserBtn.disabled = true;
  createUserBtn.textContent = "Creating...";

  try {
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, email, role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to create user");
      return;
    }

    // ✅ SHOW TEMP PASSWORD
    tempPasswordInput.value = data.tempPassword;
    tempPasswordBox.style.display = "block";

    // reset form (IMPORTANT FIX)
    document.getElementById("user-email").value = "";
    document.getElementById("user-name").value = "";
    document.getElementById("user-role").value = "";

  } catch (err) {
    console.error(err);
    alert("Server error");
  } finally {
    createUserBtn.disabled = false;
    createUserBtn.textContent = "Create User";
  }
});


// ---------------- COPY PASSWORD ----------------
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(tempPasswordInput.value);

    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  } catch (err) {
    alert("Copy failed. Please copy manually.");
  }
});
