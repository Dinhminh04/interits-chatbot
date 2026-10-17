  import { useState, useEffect } from 'react'
  import { Line, Doughnut } from 'react-chartjs-2'
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js'

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

  export default function Dashboard({ token, api, showToast, onNavigate }) {
    const [stats, setStats] = useState(null)
    const [recentLeads, setRecentLeads] = useState([])

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

    useEffect(() => {
      async function load() {
        try {
          const [sRes, lRes] = await Promise.all([
            fetch(`${api}/admin/stats`, { headers }),
            fetch(`${api}/admin/leads?limit=5`, { headers })
          ])
          const sData = await sRes.json()
          const lData = await lRes.json()
          setStats(sData)
          setRecentLeads(lData.leads || [])
        } catch { showToast('❌ Lỗi tải dữ liệu', 'error') }
      }
      load()
    }, [])

    if (!stats) return <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Đang tải...</div>

    const rate = stats.conv_total > 0 ? Math.round((stats.leads_total / stats.conv_total) * 100) : 0

    const lineData = {
      labels: (stats.leads_7days || []).map(d => d.date),
      datasets: [{
        label: 'Leads', data: (stats.leads_7days || []).map(d => d.count),
        borderColor: '#00a79d', backgroundColor: 'rgba(0,167,157,0.1)',
        tension: 0.4, fill: true, pointBackgroundColor: '#00a79d', pointRadius: 5
      }]
    }

    const doughnutData = {
      labels: (stats.top_products || []).map(p => p.name || 'Khác'),
      datasets: [{ data: (stats.top_products || []).map(p => p.count), backgroundColor: ['#00a79d', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#4caf50'] }]
    }

    function formatTime(dt) {
      if (!dt) return '-'
      return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const statusLabel = { moi: '🆕 Mới', dang_xu_ly: '⚙️ Đang xử lý', da_lien_he: '📞 Đã liên hệ', da_chot: '✅ Đã chốt' }

    return (
      <>
        {/* Stats cards */}
        <div className="stats-grid">
          {[
            { icon: '👥', iconClass: 'green', num: stats.leads_total, lbl: 'Tổng leads', change: `+${stats.leads_today} hôm nay` },
            { icon: '💬', iconClass: 'blue', num: stats.conv_total, lbl: 'Hội thoại', change: `+${stats.conv_today} hôm nay` },
            { icon: '📨', iconClass: 'orange', num: stats.msg_total, lbl: 'Tin nhắn', change: `~${stats.msg_avg} tin/hội thoại` },
            { icon: '🎯', iconClass: 'purple', num: `${rate}%`, lbl: 'Tỉ lệ chuyển đổi', change: 'leads / hội thoại' },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className={`stat-icon ${s.iconClass}`}>{s.icon}</div>
              <div className="stat-info">
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
                <div className="change">{s.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="charts-row">
          <div className="card">
            <div className="card-title">Leads theo ngày (7 ngày gần nhất)</div>
            <Line data={lineData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
          </div>
          <div className="card">
            <div className="card-title">Sản phẩm quan tâm</div>
            {(stats.top_products || []).length > 0
              ? <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
              : <div className="empty-state"><div className="icon">📊</div><p>Chưa có dữ liệu</p></div>
            }
          </div>
        </div>

        {/* Recent leads */}
        <div className="table-card">
          <div className="table-header">
            <h3>Leads gần đây</h3>
            <button className="btn-primary sm" onClick={() => onNavigate('leads')}>Xem tất cả →</button>
          </div>
          <table>
            <thead>
              <tr><th>Họ tên</th><th>Công ty</th><th>SĐT</th><th>Sản phẩm</th><th>Thời gian</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {recentLeads.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: '30px' }}>Chưa có leads</td></tr>
                : recentLeads.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.ten}</strong></td>
                    <td>{l.cong_ty || '-'}</td>
                    <td><a href={`tel:${l.sdt}`} style={{ color: '#00a79d' }}>{l.sdt || '-'}</a></td>
                    <td>{l.san_pham_quan_tam ? <span style={{ background: '#e8f8f7', color: '#00857c', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{l.san_pham_quan_tam}</span> : '-'}</td>
                    <td style={{ color: '#888', fontSize: '12px' }}>{formatTime(l.created_at)}</td>
                    <td><span className={`badge ${l.trang_thai}`}>{statusLabel[l.trang_thai] || l.trang_thai}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </>
    )
  }