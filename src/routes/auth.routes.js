const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/auth.middleware");
const authController = require("../controllers/auth.controller");

// ================= AUTH =================
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/admin-signup", authController.adminSignup);
router.post(
  "/change-password",
  authMiddleware,
  authController.changePassword
);


// ================= CHECK SUPER ADMIN EXISTS =================

router.get("/admin-exists", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM users WHERE role = 'SUPER_ADMIN'"
    );
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    console.error("ADMIN EXISTS ERROR:", err);
    res.status(500).json({ exists: false });
  }
});

module.exports = router;
