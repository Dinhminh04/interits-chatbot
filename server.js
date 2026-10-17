const express = require("express");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
require("dotenv").config();

const { chat, reloadPrompt } = require("./chatbot");
const db = require("./database");
const { sendLeadNotification } = require("./email");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Serve React build (thư mục public/) ───
app.use(express.static(path.join(__dirname, "public")));

// ─── Simple token store ───
const tokens = new Map();

function generateToken(username) {
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, { username, createdAt: Date.now() });
  return token;
}

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return tokens.get(token) || null;
}

function requireAuth(req, res, next) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.adminUser = user;
  next();
}

// ─── Health check ───
app.get("/health", (req, res) =>
  res.json({ status: "InterITS Chatbot running 🚀" }),
);

// ─── Link Preview ───
app.get("/preview", async (req, res) => {
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
});

// ─── Chat ───
app.post("/chat", async (req, res) => {
  const { session_id, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Tin nhắn không được để trống" });
  }
  const sid = session_id || uuidv4();
  try {
    const history = await db.getHistory(sid);
    const result = await chat(message, sid, history);
    await db.saveMessage(sid, "user", message);
    await db.saveMessage(sid, "assistant", result.reply);
    if (result.lead) {
      await db.saveLead(sid, result.lead);
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
});

// ─── History ───
app.get("/history/:session_id", async (req, res) => {
  try {
    const history = await db.getHistory(req.params.session_id);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy lịch sử" });
  }
});

// ════════════════════════════════════════
// ADMIN APIs
// ════════════════════════════════════════

// ─── Login ───
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.verifyAdmin(username, password);
    if (!user)
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu" });
    const token = generateToken(username);
    res.json({ token, username });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ─── Stats ───
app.get("/admin/stats", requireAuth, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
});

// ─── Leads ───
app.get("/admin/leads", requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leads = await db.getLeads(limit);
    res.json({ leads });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy leads" });
  }
});

app.put("/admin/leads/:id/status", requireAuth, async (req, res) => {
  try {
    await db.updateLeadStatus(req.params.id, req.body.status);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Lỗi cập nhật" });
  }
});

// ─── Conversations ───
app.get("/admin/conversations", requireAuth, async (req, res) => {
  try {
    const convs = await db.getConversations();
    res.json({ conversations: convs });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy hội thoại" });
  }
});

app.delete(
  "/admin/conversations/:session_id",
  requireAuth,
  async (req, res) => {
    try {
      await db.deleteConversation(req.params.session_id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Lỗi xóa hội thoại" });
    }
  },
);

// ─── System Prompt ───
app.get("/admin/prompt", requireAuth, async (req, res) => {
  try {
    const prompt = await db.getSystemPrompt();
    res.json({ prompt });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lấy prompt" });
  }
});

app.put("/admin/prompt", requireAuth, async (req, res) => {
  try {
    await db.saveSystemPrompt(req.body.prompt);
    await reloadPrompt();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Lỗi lưu prompt" });
  }
});

// ─── Fallback về React app ───
// Phải để CUỐI CÙNG, sau tất cả API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `✅ InterITS Chatbot Server đang chạy tại http://localhost:${PORT}`,
  );
});
