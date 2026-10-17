const { pool } = require("../config/db");

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

module.exports = { saveLead, getLeads, updateLeadStatus };
