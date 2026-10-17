const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ConversationChain } = require("langchain/chains");
const { BufferWindowMemory } = require("langchain/memory");
const {
  ChatPromptTemplate,
  MessagesPlaceholder,
} = require("@langchain/core/prompts");
const DEFAULT_PROMPT = require("../prompts/default-prompt");
const promptModel = require("../models/prompt.model");

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 1024,
});

const sessionMemories = new Map();
const sessionChains = new Map();


// ── Biến lưu prompt hiện tại ──
let currentPrompt = DEFAULT_PROMPT;
let promptLoaded = false;

// ── Load prompt từ DB ──
async function loadPromptFromDB() {
  try {
    const dbPrompt = await promptModel.getSystemPrompt();
    if (dbPrompt) {
      currentPrompt = dbPrompt;
      console.log("✅ Đã load System Prompt từ DB");
    } else {
      // Lưu default prompt vào DB lần đầu
      await promptModel.saveSystemPrompt(DEFAULT_PROMPT);
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
    const dbPrompt = await promptModel.getSystemPrompt();
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
