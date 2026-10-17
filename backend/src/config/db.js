const mysql = require("mysql2/promise");
const { hashPassword } = require("../utils/hash");

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

// Create tables and the default admin account on first start
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

module.exports = { pool, initDB };
