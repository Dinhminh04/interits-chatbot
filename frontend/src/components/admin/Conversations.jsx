import { useState, useEffect } from 'react'

export default function Conversations({ token, api, showToast }) {
  const [convs, setConvs] = useState([])
  const [filtered, setFiltered] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${api}/admin/conversations`, { headers })
        const data = await res.json()
        setConvs(data.conversations || [])
        setFiltered(data.conversations || [])
      } catch { showToast('❌ Lỗi tải hội thoại', 'error') }
    }
    load()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(convs.filter(c => c.session_id.toLowerCase().includes(q)))
  }, [search, convs])

  async function loadDetail(sessionId) {
    setSelected(sessionId)
    try {
      const res = await fetch(`/api/history/${sessionId}`)
      const data = await res.json()
      setMessages(data.history || [])
    } catch { showToast('❌ Lỗi tải hội thoại', 'error') }
  }

  async function deleteConv(sessionId) {
    if (!confirm(`Xóa hội thoại:\n${sessionId}\n\nHành động này không thể hoàn tác!`)) return
    try {
      await fetch(`${api}/admin/conversations/${sessionId}`, { method: 'DELETE', headers })
      setConvs(prev => prev.filter(c => c.session_id !== sessionId))
      if (selected === sessionId) { setSelected(null); setMessages([]) }
      showToast('✅ Đã xóa hội thoại!')
    } catch { showToast('❌ Lỗi xóa', 'error') }
  }

  function formatTime(dt) {
    if (!dt) return '-'
    return new Date(dt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-header">
        <h3>Hội thoại</h3>
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="Tìm session..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="conv-layout" style={{ padding: '0 24px 24px' }}>
        {/* List */}
        <div className="conv-list">
          {filtered.length === 0
            ? <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>Không có hội thoại</div>
            : filtered.map(c => (
              <div key={c.session_id} className={`conv-item ${selected === c.session_id ? 'active' : ''}`}>
                <div className="conv-avatar" onClick={() => loadDetail(c.session_id)} style={{ cursor: 'pointer' }}>💬</div>
                <div className="conv-info" onClick={() => loadDetail(c.session_id)} style={{ cursor: 'pointer' }}>
                  <div className="conv-id">{c.session_id}</div>
                  <div className="conv-time">{formatTime(c.created_at)}</div>
                </div>
                <span className="conv-msgs">{c.msg_count || 0}</span>
                <button
                  onClick={() => deleteConv(c.session_id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '16px', padding: '4px', marginLeft: '4px', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = '#e53935'}
                  onMouseOut={e => e.target.style.color = '#ccc'}
                  title="Xóa hội thoại"
                >🗑️</button>
              </div>
            ))
          }
        </div>

        {/* Detail */}
        <div>
          {!selected
            ? <div className="empty-state"><div className="icon">💬</div><p>Chọn một hội thoại để xem chi tiết</p></div>
            : (
              <>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
                  Session: {selected} · {messages.length} tin nhắn
                </div>
                <div className="chat-view">
                  {messages.length === 0
                    ? <div style={{ textAlign: 'center', color: '#888' }}>Không có tin nhắn</div>
                    : messages.map((m, i) => (
                      <div key={i} className={`chat-msg ${m.role}`}>
                        <div className="chat-role">{m.role === 'user' ? '👤 Khách hàng' : '🤖 Chatbot'}</div>
                        <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br>') }} />
                      </div>
                    ))
                  }
                </div>
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}