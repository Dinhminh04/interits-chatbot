const express = require("express");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

router.get("/health", chatController.health);
router.get("/preview", chatController.preview);
router.post("/chat", chatController.sendMessage);
router.get("/history/:session_id", chatController.getHistory);

module.exports = router;
