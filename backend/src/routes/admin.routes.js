const express = require("express");
const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", adminController.login);

router.get("/stats", requireAuth, adminController.getStats);
router.get("/leads", requireAuth, adminController.getLeads);
router.put("/leads/:id/status", requireAuth, adminController.updateLeadStatus);
router.get("/conversations", requireAuth, adminController.getConversations);
router.delete("/conversations/:session_id", requireAuth, adminController.deleteConversation);
router.get("/prompt", requireAuth, adminController.getPrompt);
router.put("/prompt", requireAuth, adminController.updatePrompt);

module.exports = router;
