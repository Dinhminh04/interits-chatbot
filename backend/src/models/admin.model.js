const { pool } = require("../config/db");
const { hashPassword } = require("../utils/hash");

async function verifyAdmin(username, password) {
  const [rows] = await pool.execute(
    `SELECT * FROM admin_users WHERE username = ? AND password_hash = ?`,
    [username, hashPassword(password)],
  );
  return rows[0] || null;
}

module.exports = { verifyAdmin };
