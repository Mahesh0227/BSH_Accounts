const express = require("express");
const router = express.Router();
const multer = require("multer");

const auth = require("../middlewares/auth.middleware");
const uploadController = require("../controllers/upload.controller");

// memory storage (Excel buffer kosam)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/upload/excel
router.post(
  "/excel",
  auth,
  upload.single("file"), // 👈 VERY IMPORTANT
  uploadController.uploadExcel
);

module.exports = router;
