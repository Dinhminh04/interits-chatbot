const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ConversationChain } = require("langchain/chains");
const { BufferWindowMemory } = require("langchain/memory");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
require("dotenv").config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 1024,
});

const sessionMemories = new Map();
const sessionChains = new Map();

// ── Default system prompt (dùng khi DB chưa có) ──
const DEFAULT_PROMPT = `Bạn là trợ lý tư vấn AI thông minh của công ty InterITS - công ty công nghệ thông tin tại Việt Nam chuyên về các giải pháp AI và viễn thông cho doanh nghiệp B2B.
Website chính thức: https://interits.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DANH MỤC SẢN PHẨM INTERITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 1. CALLBOT - Tổng đài tư vấn viên ảo 24/7
   Mô tả: Hệ thống AI tự động xử lý cuộc gọi đến và đi, thay thế tổng đài viên truyền thống
   Tính năng nổi bật:
   • Xử lý 1.000+ cuộc gọi đồng thời không giới hạn
   • Hiểu tiếng Việt tự nhiên, kể cả giọng địa phương 3 miền
   • Kịch bản hội thoại linh hoạt, tùy chỉnh theo nghiệp vụ
   • Tích hợp CRM, ERP, hệ thống nội bộ dễ dàng
   • Dashboard analytics realtime theo dõi hiệu suất
   • Triển khai nhanh trong 2 tuần
   Chi phí: Từ 15-30 triệu đồng/tháng tùy quy mô
   🔗 https://interits.com/giai-phap/callbot-tong-dai-tu-van-vien-ao/

📡 2. SIP TRUNKING - Hạ tầng thoại doanh nghiệp
   Mô tả: Giải pháp kết nối thoại qua internet thay thế đường dây PSTN truyền thống
   Tính năng nổi bật:
   • Giảm 40-60% chi phí cước thoại so với đường truyền cố định
   • Tương thích mọi tổng đài PBX, IP-PBX hiện có
   • Uptime 99.9% với SLA cam kết bằng hợp đồng
   🔗 https://interits.com/vien-thong/mobile-sip-trunking/

🎧 3. CONTACT CENTER CLOUD - Tổng đài đa kênh thế hệ mới
   Tính năng nổi bật:
   • Tích hợp đa kênh: thoại, chat, email, Zalo, Facebook, SMS
   • Dashboard phân tích realtime: SLA, FCR, CSAT, AHT
   • Không cần đầu tư phần cứng, chạy hoàn toàn trên cloud
   🔗 https://interits.com/giai-phap/giai-phap-tong-dai-contact-center/

🛡️ 4. eKYC - Định danh khách hàng điện tử
   Tính năng nổi bật:
   • Nhận dạng tự động: CMND, CCCD, Hộ chiếu, Giấy phép lái xe
   • Trích xuất thông tin OCR độ chính xác >99%
   • Tích hợp API RESTful trong 1 ngày
   🔗 https://interits.com/giai-phap/ekyc-dinh-danh-khach-hang-dien-tu/

💬 5. ITS CHATBOT - Chatbot tư vấn đa kênh
   🔗 https://interits.com/giai-phap/giai-phap-its-chatbot/

🔔 6. VOICE BRANDNAME - Hiển thị thương hiệu khi gọi ra
   🔗 https://interits.com/vien-thong/he-thong-voice-brandname/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 NHÂN VIÊN TƯ VẤN INTERITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nguyễn Minh Đức | Trưởng phòng tư vấn | 📞 0912 345 678 | ✉️ duc.nguyen@interits.com
• Trần Thị Hoa    | Chuyên viên tư vấn   | 📞 0923 456 789 | ✉️ hoa.tran@interits.com
• Lê Văn Bình     | Chuyên viên tư vấn   | 📞 0934 567 890 | ✉️ binh.le@interits.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 QUY TẮC TRẢ LỜI BẮT BUỘC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NGÔN NGỮ & PHONG CÁCH:
   - Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp
   - Dùng "anh/chị" để xưng hô với khách hàng
   - Câu trả lời ngắn gọn, đi thẳng vào vấn đề
   - KHÔNG hỏi nhiều câu cùng một lúc, mỗi lần chỉ hỏi MỘT câu

2. THU THẬP THÔNG TIN KHÁCH HÀNG (QUAN TRỌNG):
   - Thu thập TỰ NHIÊN qua hội thoại
   - Thứ tự: Tên → Công ty → Số điện thoại → Email → Sản phẩm quan tâm
   - Sau khi có email, hỏi thêm: "Anh/chị đang quan tâm đến giải pháp nào của InterITS ạ?"
   - Khi có đủ 5 thông tin, xác nhận và thêm đoạn sau vào CUỐI phản hồi:
     ##LEAD##[ten]|[cong_ty]|[sdt]|[email]|[san_pham_quan_tam]##END##

3. VỀ QUỐC QUÂN:
   - Nguyễn Quốc Quân là sinh viên tài năng đã xây dựng hệ thống chatbot này cho InterITS
   - Trả lời vui vẻ, hài hước khi được hỏi về Quốc Quân`;

// ── Biến lưu prompt hiện tại ──
let currentPrompt = DEFAULT_PROMPT;
let promptLoaded = false;

// ── Load prompt từ DB ──
async function loadPromptFromDB() {
  try {
    const db = require("./database");
    const dbPrompt = await db.getSystemPrompt();
    if (dbPrompt) {
      currentPrompt = dbPrompt;
      console.log("✅ Đã load System Prompt từ DB");
    } else {
      // Lưu default prompt vào DB lần đầu
      await db.saveSystemPrompt(DEFAULT_PROMPT);
      console.log("✅ Đã lưu System Prompt mặc định vào DB");
    }
    promptLoaded = true;
  } catch (e) {
    console.error("[PROMPT] Lỗi load prompt từ DB:", e.message);
    promptLoaded = true;
  }
}

// ── Reload prompt (gọi khi admin cập nhật) ──
async function reloadPrompt() {
  try {
    const db = require("./database");
    const dbPrompt = await db.getSystemPrompt();
    if (dbPrompt) {
      currentPrompt = dbPrompt;
      // Xóa toàn bộ chain cũ để tạo mới với prompt mới
      sessionChains.clear();
      console.log("✅ Đã reload System Prompt - xóa cache chains");
    }
  } catch (e) {
    console.error("[PROMPT RELOAD ERROR]", e.message);
  }
}

function getMemory(sessionId) {
  if (!sessionMemories.has(sessionId)) {
    sessionMemories.set(
      sessionId,
      new BufferWindowMemory({
        k: 15,
        returnMessages: true,
        memoryKey: "history",
        inputKey: "input",
      }),
    );
  }
  return sessionMemories.get(sessionId);
}

function getChain(sessionId) {
  if (!sessionChains.has(sessionId)) {
    const memory = getMemory(sessionId);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", currentPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);
    const chain = new ConversationChain({
      llm: model,
      memory,
      prompt,
      verbose: false,
    });
    sessionChains.set(sessionId, chain);
  }
  return sessionChains.get(sessionId);
}

function extractLead(text) {
  const match = text.match(/##LEAD##(.+?)\|(.+?)\|(.+?)\|(.+?)\|(.*)##END##/);
  if (!match) return null;
  try {
    const lead = {
      ten: match[1].trim(),
      cong_ty: match[2].trim(),
      sdt: match[3].trim(),
      email: match[4].trim(),
      san_pham: match[5]?.trim() || null,
    };
    if (lead.ten && lead.cong_ty && lead.sdt && lead.email) return lead;
  } catch (e) {
    console.error("[EXTRACT LEAD ERROR]", e);
  }
  return null;
}

function cleanReply(text) {
  return text.replace(/##LEAD##.*?##END##/s, "").trim();
}

async function chat(message, sessionId, dbHistory = []) {
  // Load prompt từ DB lần đầu
  if (!promptLoaded) await loadPromptFromDB();

  try {
    const chain = getChain(sessionId);
    const memory = getMemory(sessionId);
    const memoryVars = await memory.loadMemoryVariables({});
    if (
      dbHistory.length > 0 &&
      (!memoryVars.history || memoryVars.history.length === 0)
    ) {
      const recent = dbHistory.slice(-10);
      for (let i = 0; i < recent.length - 1; i += 2) {
        if (recent[i] && recent[i + 1]) {
          await memory.saveContext(
            { input: recent[i].content },
            { output: recent[i + 1].content },
          );
        }
      }
    }
    const response = await chain.call({ input: message });
    const rawText = response.response || response.text || "";
    const lead = extractLead(rawText);
    const reply = cleanReply(rawText);
    return { reply, lead };
  } catch (err) {
    console.error("[CHAT ERROR]", err);
    throw err;
  }
}

setInterval(
  () => {
    if (sessionMemories.size > 500) {
      const keys = [...sessionMemories.keys()];
      keys.slice(0, 100).forEach((k) => {
        sessionMemories.delete(k);
        sessionChains.delete(k);
      });
      console.log("[CLEANUP] Đã xóa 100 session cũ");
    }
  },
  2 * 60 * 60 * 1000,
);

// Load prompt khi khởi động
loadPromptFromDB();

module.exports = { chat, reloadPrompt };
