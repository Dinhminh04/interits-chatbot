const { reloadPrompt } = require("../services/chatbot.service");
const { generateToken } = require("../services/auth.service");
const adminModel = require("../models/admin.model");
const statsModel = require("../models/stats.model");
const leadModel = require("../models/lead.model");
const conversationModel = require("../models/conversation.model");
const promptModel = require("../models/prompt.model");

// ─── Login ───
async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await adminModel.verifyAdmin(username, password);
    if (!user)
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    const token = generateToken(username);
    res.json({ token, username });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi server" });
  }
}

// ─── Stats ───
async function getStats(req, res) {
  try {
    const stats = await statsModel.getStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
}

// ─── Leads ───
async function getLeads(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leads = await leadModel.getLeads(limit);
    res.json({ leads });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy leads" });
  }
}

async function updateLeadStatus(req, res) {
  try {
    await leadModel.updateLeadStatus(req.params.id, req.body.status);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Lỗi cập nhật" });
  }
}

// ─── Conversations ───
async function getConversations(req, res) {
  try {
    const convs = await conversationModel.getConversations();
    res.json({ conversations: convs });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy hội thoại" });
  }
}

async function deleteConversation(req, res) {
  try {
    await conversationModel.deleteConversation(req.params.session_id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Lỗi xóa hội thoại" });
  }
}

// ─── System Prompt ───
async function getPrompt(req, res) {
  try {
    const prompt = await promptModel.getSystemPrompt();
    res.json({ prompt });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy prompt" });
  }
}

async function updatePrompt(req, res) {
  try {
    await promptModel.saveSystemPrompt(req.body.prompt);
    await reloadPrompt();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lưu prompt" });
  }
}

module.exports = {
  login,
  getStats,
  getLeads,
  updateLeadStatus,
  getConversations,
  deleteConversation,
  getPrompt,
  updatePrompt,
};
