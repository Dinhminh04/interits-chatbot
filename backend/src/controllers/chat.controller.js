const { v4: uuidv4 } = require("uuid");
const { chat } = require("../services/chatbot.service");
const { sendLeadNotification } = require("../services/email.service");
const conversationModel = require("../models/conversation.model");
const leadModel = require("../models/lead.model");

// ─── Health check ───
function health(req, res) {
  res.json({ status: "InterITS Chatbot running 🚀" });
}

// ─── Link Preview ───
async function preview(req, res) {
  const { url } = req.query;
  if (!url) return res.json({});
  try {
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
    );
    const data = await response.json();
    if (data.status === "success") {
      return res.json({
        title: data.data.title || "",
        description: data.data.description || "",
        image: data.data.image?.url || null,
      });
    }
  } catch (e) {
    console.error("[PREVIEW ERROR]", e.message);
  }
  res.json({});
}

// ─── Chat ───
async function sendMessage(req, res) {
  const { session_id, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Tin nhắn không được để trống" });
  }
  const sid = session_id || uuidv4();
  try {
    const history = await conversationModel.getHistory(sid);
    const result = await chat(message, sid, history);
    await conversationModel.saveMessage(sid, "user", message);
    await conversationModel.saveMessage(sid, "assistant", result.reply);
    if (result.lead) {
      await leadModel.saveLead(sid, result.lead);
      sendLeadNotification(result.lead, sid).catch(console.error);
    }
    return res.json({
      session_id: sid,
      reply: result.reply,
      lead_collected: !!result.lead,
    });
  } catch (err) {
    console.error("[CHAT ERROR]", err);
    return res.status(500).json({
      session_id: sid,
      reply: "Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
    });
  }
}

// ─── History ───
async function getHistory(req, res) {
  try {
    const history = await conversationModel.getHistory(req.params.session_id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy lịch sử" });
  }
}

module.exports = { health, preview, sendMessage, getHistory };
