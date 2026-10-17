import { useState, useEffect } from 'react'
import Dashboard from '../components/admin/Dashboard.jsx'
import Leads from '../components/admin/Leads.jsx'
import Conversations from '../components/admin/Conversations.jsx'
import SystemPrompt from '../components/admin/SystemPrompt.jsx'

const API = '/api'

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [adminUser, setAdminUser] = useState(localStorage.getItem('admin_user') || '')
  const [page, setPage] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [time, setTime] = useState(new Date().toLocaleString('vi-VN'))

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleString('vi-VN')), 1000)
    return () => clearInterval(t)
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function doLogout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken(null)
  }

  if (!token) return <LoginScreen onLogin={(t, u) => { setToken(t); setAdminUser(u) }} />

  const titles = { dashboard: 'Dashboard', leads: 'Khách hàng tiềm năng', conversations: 'Hội thoại', prompt: 'System Prompt' }
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'Tổng quan' },
    { id: 'leads', icon: '👥', label: 'Khách hàng tiềm năng', section: 'Quản lý' },
    { id: 'conversations', icon: '💬', label: 'Hội thoại', section: null },
    { id: 'prompt', icon: '🤖', label: 'System Prompt', section: 'Cài đặt' },
  ]

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="https://interits.com/wp-content/uploads/2021/03/logo_its.jpg" alt="InterITS" />
          <span>InterITS Admin</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <div key={item.id}>
              {item.section && <div className="nav-section">{item.section}</div>}
              <button
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={doLogout}>
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">{titles[page]}</div>
          <div className="topbar-right">
            <div className="topbar-time">{time}</div>
            <div className="admin-avatar">{adminUser.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        <div className="page-content">
          {page === 'dashboard' && <Dashboard token={token} api={API} showToast={showToast} onNavigate={setPage} />}
          {page === 'leads' && <Leads token={token} api={API} showToast={showToast} />}
          {page === 'conversations' && <Conversations token={token} api={API} showToast={showToast} />}
          {page === 'prompt' && <SystemPrompt token={token} api={API} showToast={showToast} />}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function doLogin() {
    if (!username || !password) return
    try {
      const res = await fetch(`${'/api'}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_user', username)
        onLogin(data.token, username)
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng')
      }
    } catch {
      setError('Không kết nối được server')
    }
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo">
          <img src="https://interits.com/wp-content/uploads/2021/03/logo_its.jpg" alt="InterITS" />
          <h2>Quản trị Chatbot</h2>
          <p>Đăng nhập để tiếp tục</p>
        </div>
        <div className="login-field">
          <label>Tên đăng nhập</label>
          <input
            type="text" value={username} placeholder="admin"
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
          />
        </div>
        <div className="login-field">
          <label>Mật khẩu</label>
          <input
            type="password" value={password} placeholder="••••••••"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
          />
        </div>
        <button className="login-btn" onClick={doLogin}>Đăng nhập</button>
        {error && <div className="login-error">❌ {error}</div>}
      </div>
    </div>
  )
}