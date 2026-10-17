const mysql = require("mysql2/promise");
const crypto = require("crypto");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "interits_chatbot",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "interits_salt_2026")
    .digest("hex");
}

async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_session (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_msg (session_id),
        FOREIGN KEY (session_id) REFERENCES conversations(session_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100),
        ten VARCHAR(255) NOT NULL,
        cong_ty VARCHAR(255),
        sdt VARCHAR(20),
        email VARCHAR(255),
        san_pham_quan_tam TEXT,
        trang_thai ENUM('moi','dang_xu_ly','da_lien_he','da_chot') DEFAULT 'moi',
        ghi_chu TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lead_session (session_id),
        INDEX idx_trang_thai (trang_thai)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS system_prompts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        prompt LONGTEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tạo tài khoản admin mặc định nếu chưa có
    const [admins] = await conn.execute(`SELECT id FROM admin_users LIMIT 1`);
    if (admins.length === 0) {
      await conn.execute(
        `INSERT INTO admin_users (username, password_hash, full_name) VALUES (?, ?, ?)`,
        ["admin", hashPassword("admin123"), "Quản trị viên"],
      );
      console.log("✅ Tài khoản admin mặc định: admin / admin123");
    }

    console.log("✅ Database đã sẵn sàng");
  } catch (err) {
    console.error("❌ Lỗi khởi tạo DB:", err.message);
  } finally {
    conn.release();
  }
}

// ── Verify admin ──
async function verifyAdmin(username, password) {
  const [rows] = await pool.execute(
    `SELECT * FROM admin_users WHERE username = ? AND password_hash = ?`,
    [username, hashPassword(password)],
  );
  return rows[0] || null;
}

// ── Messages ──
async function saveMessage(sessionId, role, content) {
  await pool.execute(
    `INSERT IGNORE INTO conversations (session_id) VALUES (?)`,
    [sessionId],
  );
  await pool.execute(
    `INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)`,
    [sessionId, role, content],
  );
}

async function getHistory(sessionId, limit = 20) {
  const [rows] = await pool.execute(
    `SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?`,
    [sessionId, limit],
  );
  return rows;
}

// ── Leads ──
async function saveLead(sessionId, lead) {
  const [existing] = await pool.execute(
    `SELECT id FROM leads WHERE session_id = ? LIMIT 1`,
    [sessionId],
  );
  if (existing.length > 0) {
    await pool.execute(
      `UPDATE leads SET ten=?, cong_ty=?, sdt=?, email=?, san_pham_quan_tam=?, updated_at=NOW() WHERE session_id=?`,
      [lead.ten, lead.cong_ty, lead.sdt, lead.email, lead.san_pham, sessionId],
    );
  } else {
    await pool.execute(
      `INSERT INTO leads (session_id, ten, cong_ty, sdt, email, san_pham_quan_tam) VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, lead.ten, lead.cong_ty, lead.sdt, lead.email, lead.san_pham],
    );
    console.log(`[LEAD NEW] ${lead.ten} - ${lead.cong_ty} - ${lead.san_pham}`);
  }
}

async function getLeads(limit = 100) {
  const [rows] = await pool.execute(
    `SELECT id, session_id, ten, cong_ty, sdt, email, san_pham_quan_tam, trang_thai, ghi_chu, created_at, updated_at
     FROM leads ORDER BY created_at DESC LIMIT ?`,
    [limit],
  );
  return rows;
}

async function updateLeadStatus(id, status) {
  await pool.execute(
    `UPDATE leads SET trang_thai=?, updated_at=NOW() WHERE id=?`,
    [status, id],
  );
}

// ── Conversations ──
async function getConversations() {
  const [rows] = await pool.execute(`
    SELECT c.session_id, c.created_at,
           COUNT(m.id) as msg_count
    FROM conversations c
    LEFT JOIN messages m ON c.session_id = m.session_id
    GROUP BY c.session_id, c.created_at
    ORDER BY c.created_at DESC
    LIMIT 100
  `);
  return rows;
}

async function deleteConversation(sessionId) {
  await pool.execute(`DELETE FROM conversations WHERE session_id = ?`, [
    sessionId,
  ]);
  console.log(`[DELETE] Đã xóa conversation: ${sessionId}`);
}

// ── Stats ──
async function getStats() {
  const [[leadsTotal]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM leads`,
  );
  const [[leadsToday]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM leads WHERE DATE(created_at) = CURDATE()`,
  );
  const [[convTotal]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM conversations`,
  );
  const [[convToday]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM conversations WHERE DATE(created_at) = CURDATE()`,
  );
  const [[msgTotal]] = await pool.execute(
    `SELECT COUNT(*) as cnt FROM messages`,
  );
  const [[msgAvg]] = await pool.execute(
    `SELECT ROUND(AVG(cnt),1) as avg FROM (SELECT COUNT(*) as cnt FROM messages GROUP BY session_id) t`,
  );

  // Leads 7 ngày
  const [leads7days] = await pool.execute(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM leads
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  // Top sản phẩm
  const [topProducts] = await pool.execute(`
    SELECT san_pham_quan_tam as name, COUNT(*) as count
    FROM leads
    WHERE san_pham_quan_tam IS NOT NULL AND san_pham_quan_tam != ''
    GROUP BY san_pham_quan_tam
    ORDER BY count DESC
    LIMIT 6
  `);

  return {
    leads_total: leadsTotal.cnt,
    leads_today: leadsToday.cnt,
    conv_total: convTotal.cnt,
    conv_today: convToday.cnt,
    msg_total: msgTotal.cnt,
    msg_avg: msgAvg.avg || 0,
    leads_7days: leads7days.map((r) => ({
      date: r.date?.toString().slice(5),
      count: r.count,
    })),
    top_products: topProducts,
  };
}

// ── System Prompt ──
async function getSystemPrompt() {
  const [rows] = await pool.execute(
    `SELECT prompt FROM system_prompts ORDER BY id DESC LIMIT 1`,
  );
  return rows[0]?.prompt || null;
}

async function saveSystemPrompt(prompt) {
  const [existing] = await pool.execute(
    `SELECT id FROM system_prompts LIMIT 1`,
  );
  if (existing.length > 0) {
    await pool.execute(
      `UPDATE system_prompts SET prompt=?, updated_at=NOW() WHERE id=?`,
      [prompt, existing[0].id],
    );
  } else {
    await pool.execute(`INSERT INTO system_prompts (prompt) VALUES (?)`, [
      prompt,
    ]);
  }
}

initDB();

module.exports = {
  saveMessage,
  getHistory,
  saveLead,
  getLeads,
  updateLeadStatus,
  getConversations,
  deleteConversation,
  getStats,
  getSystemPrompt,
  saveSystemPrompt,
  verifyAdmin,
};
