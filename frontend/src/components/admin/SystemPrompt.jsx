import { useState, useEffect } from 'react'

export default function SystemPrompt({ token, api, showToast }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => { loadPrompt() }, [])

  async function loadPrompt() {
    setLoading(true)
    try {
      const res = await fetch(`${api}/admin/prompt`, { headers })
      const data = await res.json()
      setPrompt(data.prompt || '')
    } catch { showToast('❌ Lỗi tải prompt', 'error') }
    setLoading(false)
  }

  async function savePrompt() {
    if (!prompt.trim()) return
    setSaving(true)
    try {
      await fetch(`${api}/admin/prompt`, {
        method: 'PUT', headers,
        body: JSON.stringify({ prompt })
      })
      showToast('✅ Đã lưu System Prompt thành công!')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { showToast('❌ Lỗi lưu prompt', 'error') }
    setSaving(false)
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#1a1f2e' }}>🤖 System Prompt</h3>
      <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
        Chỉnh sửa cách chatbot giao tiếp và tư vấn khách hàng. Thay đổi sẽ có hiệu lực ngay lập tức với các hội thoại mới.
      </p>
      {loading
        ? <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Đang tải...</div>
        : (
          <>
            <textarea
              className="prompt-textarea"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Nhập System Prompt..."
            />
            <div className="prompt-actions">
              <button className="btn-primary" onClick={savePrompt} disabled={saving}>
                {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
              <button className="btn-secondary" onClick={loadPrompt}>↺ Tải lại</button>
              {saved && <span className="save-msg">✅ Đã lưu thành công!</span>}
            </div>
          </>
        )
      }
    </div>
  )
}