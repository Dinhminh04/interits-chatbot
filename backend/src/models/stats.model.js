const { pool } = require("../config/db");

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

module.exports = { getStats };
