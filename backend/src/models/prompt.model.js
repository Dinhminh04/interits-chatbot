const { pool } = require("../config/db");

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

module.exports = { getSystemPrompt, saveSystemPrompt };
