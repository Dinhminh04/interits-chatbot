const { pool } = require("../config/db");

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

module.exports = { saveMessage, getHistory, getConversations, deleteConversation };
