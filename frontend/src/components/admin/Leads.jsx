import { useState, useEffect } from 'react'

const PER_PAGE = 10
const STATUS_LABELS = { moi: '🆕 Mới', dang_xu_ly: '⚙️ Đang xử lý', da_lien_he: '📞 Đã liên hệ', da_chot: '✅ Đã chốt' }

export default function Leads({ token, api, showToast }) {
  const [leads, setLeads] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${api}/admin/leads?limit=200`, { headers })
        const data = await res.json()
        setLeads(data.leads || [])
        setFiltered(data.leads || [])
      } catch { showToast('❌ Lỗi tải leads', 'error') }
    }
    load()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(leads.filter(l =>
      [l.ten, l.cong_ty, l.sdt, l.email].some(v => (v || '').toLowerCase().includes(q))
    ))
    setPage(1)
  }, [search, leads])

  async function updateStatus(id, status) {
    try {
      await fetch(`${api}/admin/leads/${id}/status`, {
        method: 'PUT', headers,
        body: JSON.stringify({ status })
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, trang_thai: status } : l))
      showToast('✅ Đã cập nhật trạng thái!')
    } catch { showToast('❌ Lỗi cập nhật', 'error') }
  }

  function formatTime(dt) {
    if (!dt) return '-'
    return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const start = (page - 1) * PER_PAGE
  const paged = filtered.slice(start, start + PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="table-card">
      <div className="table-header">
        <h3>Khách hàng tiềm năng</h3>
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text" placeholder="Tìm kiếm..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr><th>#</th><th>Họ tên</th><th>Công ty</th><th>SĐT</th><th>Email</th><th>Sản phẩm</th><th>Thời gian</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>
          {paged.length === 0
            ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Không có dữ liệu</td></tr>
            : paged.map((l, i) => (
              <tr key={l.id}>
                <td style={{ color: '#888', fontSize: '12px' }}>{start + i + 1}</td>
                <td><strong>{l.ten}</strong></td>
                <td>{l.cong_ty || '-'}</td>
                <td><a href={`tel:${l.sdt}`} style={{ color: '#00a79d', fontWeight: 600 }}>{l.sdt || '-'}</a></td>
                <td><a href={`mailto:${l.email}`} style={{ color: '#666' }}>{l.email || '-'}</a></td>
                <td>{l.san_pham_quan_tam ? <span style={{ background: '#e8f8f7', color: '#00857c', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{l.san_pham_quan_tam}</span> : '-'}</td>
                <td style={{ color: '#888', fontSize: '12px' }}>{formatTime(l.created_at)}</td>
                <td>
                  <select
                    className="status-select"
                    value={l.trang_thai}
                    onChange={e => updateStatus(l.id, e.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i} className={`page-btn ${page === i + 1 ? 'active' : ''}`}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  )
}