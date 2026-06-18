const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { chatAI } = require("../controllers/aiController");

router.post("/chat", protect, chatAI);

module.exports = router;