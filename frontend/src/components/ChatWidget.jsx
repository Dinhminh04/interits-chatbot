import { useState, useEffect, useRef, useCallback } from 'react'

const API_URL = '/api/chat'
const HISTORY_URL = '/api/history'

const LINK_ICONS = {
  'callbot': '🤖', 'contact-center': '🎧', 'ekyc': '🛡️',
  'chatbot': '💬', 'sip-trunking': '📡', 'mobile-sip': '📡',
  'voice-brandname': '🔔', 'interits.com': '🌐'
}

const LINK_PREVIEWS = {
  'callbot-tong-dai-tu-van-vien-ao': { title: 'Callbot – Tổng đài tư vấn viên ảo 24/7', description: 'Xử lý 1.000+ cuộc gọi đồng thời, hiểu tiếng Việt tự nhiên', image: 'https://interits.com/wp-content/uploads/2021/04/callbot2.jpg' },
  'giai-phap-tong-dai-contact-center': { title: 'Contact Center Cloud – Tổng đài đa kênh', description: 'Tích hợp thoại, chat, email, Zalo, Facebook trên một nền tảng', image: 'https://interits.com/wp-content/uploads/2023/03/contact-center-its.png' },
  'ekyc-dinh-danh-khach-hang-dien-tu': { title: 'eKYC – Định danh khách hàng điện tử', description: 'Xác minh CMND, CCCD tự động với độ chính xác >99%', image: 'https://interits.com/wp-content/uploads/2021/04/ekyc.jpg' },
  'giai-phap-its-chatbot': { title: 'ITS Chatbot – Chatbot tư vấn đa kênh', description: 'Tư vấn khách hàng tự động 24/7 trên website, Zalo, Facebook', image: 'https://interits.com/wp-content/uploads/2021/03/logo_its.jpg' },
  'mobile-sip-trunking': { title: 'SIP Trunking – Hạ tầng thoại doanh nghiệp', description: 'Giảm 40-60% chi phí cước thoại, uptime 99.9% SLA', image: 'https://interits.com/wp-content/uploads/2021/04/mobile-sip-trunking.jpeg' },
  'he-thong-voice-brandname': { title: 'Voice Brandname – Hiển thị thương hiệu khi gọi', description: 'Tăng tỷ lệ bắt máy lên 40%', image: 'https://interits.com/wp-content/uploads/2021/04/voice-brandname.jpeg' },
}

function getLinkIcon(url) {
  for (const [k, v] of Object.entries(LINK_ICONS)) {
    if (url.includes(k)) return v
  }
  return '🔗'
}

function getLinkPreview(url) {
  for (const [key, meta] of Object.entries(LINK_PREVIEWS)) {
    if (url.includes(key)) return { ...meta, url }
  }
  return null
}

function parseMarkdown(text) {
  const links = []
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, l, u) => {
      if (u.includes('interits.com')) links.push(u)
      return `<a href="${u}" target="_blank" rel="noopener">${l}</a>`
    })
    .replace(/(?<![\"(>])(https?:\/\/[^\s<"]+)/g, u => {
      if (u.includes('interits.com')) links.push(u)
      return `<a href="${u}" target="_blank" rel="noopener">${u}</a>`
    })
    .replace(/\n/g, '<br>')
  return { html, links: [...new Set(links)] }
}

function LinkCard({ url }) {
  const meta = getLinkPreview(url)
  if (!meta) return null
  const icon = getLinkIcon(url)
  const short = url.replace(/https?:\/\//, '').replace(/\/$/, '')
  return (
    <a className="lp-card" href={url} target="_blank" rel="noopener noreferrer">
      {meta.image
        ? <img className="lp-img" src={meta.image} alt="" onError={e => { e.target.style.display = 'none' }} />
        : <div className="lp-placeholder">{icon}</div>
      }
      <div className="lp-body">
        <div className="lp-title">{meta.title}</div>
        {meta.description && <div className="lp-desc">{meta.description}</div>}
        <div className="lp-url">{icon} {short}</div>
      </div>
    </a>
  )
}

function BotMessage({ text }) {
  const { html, links } = parseMarkdown(text)
  return (
    <div className="c-bot-wrap">
      <div className="c-bot-icon">🤖</div>
      <div className="c-bot-msg">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {links.map((url, i) => <LinkCard key={i} url={url} />)}
      </div>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div className="c-user-wrap">
      <div className="c-user-msg">{text}</div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="c-bot-wrap">
      <div className="c-bot-icon">🤖</div>
      <div className="c-typing">
        <span /><span /><span />
      </div>
    </div>
  )
}

const QUICK_REPLIES = [
  { label: '🤖 Callbot', text: 'Callbot là gì?' },
  { label: '📡 SIP Trunking', text: 'SIP Trunking là gì?' },
  { label: '🎧 Contact Center', text: 'Contact Center Cloud là gì?' },
  { label: '🛡️ eKYC', text: 'eKYC hỗ trợ những gì?' },
  { label: '💬 ITS Chatbot', text: 'ITS Chatbot là gì?' },
  { label: '📊 Báo giá', text: 'Tôi muốn nhận báo giá chi tiết' },
  { label: '🤝 Gặp nhân viên', text: 'Tôi muốn gặp nhân viên tư vấn' },
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [showTimeout, setShowTimeout] = useState(false)
  const [showBadge, setShowBadge] = useState(true)
  const [spamWarn, setSpamWarn] = useState(false)
  const [leadNotify, setLeadNotify] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const messagesEndRef = useRef(null)
  const timeoutRef = useRef(null)
  const msgTimestamps = useRef([])
  const sessionId = useRef(
    localStorage.getItem('its_session') || (() => {
      const id = 'ses_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
      localStorage.setItem('its_session', id)
      return id
    })()
  )

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Load history on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${HISTORY_URL}/${sessionId.current}`)
        const data = await res.json()
        if (data.history?.length > 0) {
          const msgs = data.history.slice(-20).map(m => ({ role: m.role, text: m.content }))
          setMessages([{ role: 'system', text: '── Hội thoại trước được khôi phục ──' }, ...msgs])
        } else {
          setMessages([{ role: 'bot', text: '👋 Xin chào! Tôi là trợ lý tư vấn AI của **InterITS**.\n\nTôi có thể hỗ trợ anh/chị tìm hiểu các giải pháp công nghệ phù hợp cho doanh nghiệp.\n\nAnh/chị quan tâm đến sản phẩm nào?' }])
          setShowQuick(true)
        }
      } catch {
        setMessages([{ role: 'bot', text: '👋 Xin chào! Tôi là trợ lý tư vấn AI của **InterITS**.\n\nAnh/chị quan tâm đến sản phẩm nào?' }])
        setShowQuick(true)
      }
    }
    load()
  }, [])

  function checkSpam() {
    const now = Date.now()
    msgTimestamps.current = msgTimestamps.current.filter(t => now - t < 60000)
    if (msgTimestamps.current.length >= 20) return false
    msgTimestamps.current.push(now)
    return true
  }

  async function sendMessage(text) {
    if (!text?.trim() || isWaiting) return
    if (!checkSpam()) {
      setSpamWarn(true)
      setTimeout(() => setSpamWarn(false), 5000)
      return
    }

    setShowQuick(false)
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setIsWaiting(true)
    setShowTimeout(false)

    timeoutRef.current = setTimeout(() => setShowTimeout(true), 10000)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId.current, message: text })
      })
      const data = await res.json()
      clearTimeout(timeoutRef.current)
      setIsWaiting(false)
      setShowTimeout(false)
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
        if (data.lead_collected) setLeadNotify(true)
      }
    } catch {
      clearTimeout(timeoutRef.current)
      setIsWaiting(false)
      setShowTimeout(false)
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Không kết nối được server. Vui lòng thử lại sau hoặc liên hệ hotline: 0962510256' }])
    }
  }

  async function restartChat() {
    if (!confirm('Bắt đầu hội thoại mới?\nToàn bộ lịch sử sẽ bị xóa.')) return
    try {
      await fetch(`/api/admin/conversations/${sessionId.current}`, { method: 'DELETE' })
    } catch {}
    const newId = 'ses_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
    sessionId.current = newId
    localStorage.setItem('its_session', newId)
    setMessages([{ role: 'bot', text: '👋 Xin chào! Tôi là trợ lý tư vấn AI của **InterITS**.\n\nAnh/chị quan tâm đến sản phẩm nào?' }])
    setShowQuick(true)
    setLeadNotify(false)
  }

  const containerStyle = {
    width: expanded ? '600px' : '390px',
    height: expanded ? '85vh' : '620px',
  }

  return (
    <>
      {/* Toggle button */}
      <div style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 9999 }}>
        <button className="chat-toggle" onClick={() => { setOpen(!open); setShowBadge(false) }} style={{ position: 'relative' }}>
          <span>{open ? '✕' : '💬'}</span>
          {showBadge && !open && <span className="chat-badge">1</span>}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="chat-container" style={containerStyle}>
          {/* Header */}
          <div className="c-header">
            <div className="c-header-left">
              <div className="c-avatar">🤖</div>
              <div>
                <div className="c-title">InterITS Assistant</div>
                <div className="c-status"><span className="c-dot"></span>Đang hoạt động</div>
              </div>
            </div>
            <div className="c-header-btns">
              <button className="c-btn" onClick={restartChat} title="Bắt đầu lại" style={{ fontSize: '16px' }}>🔄</button>
              <button className="c-btn" onClick={() => setExpanded(!expanded)} title={expanded ? 'Thu nhỏ' : 'Phóng to'}>
                {expanded ? '⊡' : '⛶'}
              </button>
              <button className="c-btn" onClick={() => setOpen(false)}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div className="c-messages">
            {messages.map((msg, i) => {
              if (msg.role === 'system') return (
                <div key={i} style={{ textAlign: 'center', fontSize: '11px', color: '#aaa', padding: '4px 0' }}>{msg.text}</div>
              )
              if (msg.role === 'bot' || msg.role === 'assistant') return <BotMessage key={i} text={msg.text} />
              return <UserMessage key={i} text={msg.text} />
            })}

            {showQuick && (
              <div className="c-quick">
                {QUICK_REPLIES.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q.text)}>{q.label}</button>
                ))}
              </div>
            )}

            {isWaiting && <TypingIndicator />}
            {showTimeout && (
              <div className="c-timeout-warn">⏳ Đang xử lý, vui lòng chờ thêm chút...</div>
            )}
            {spamWarn && (
              <div className="c-spam-warn">⚠️ Bạn đang gửi quá nhiều tin nhắn. Vui lòng chờ 1 phút.</div>
            )}
            {leadNotify && (
              <div className="c-lead-notify">✅ Thông tin của anh/chị đã được ghi nhận. Nhân viên InterITS sẽ liên hệ sớm nhất!</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="c-input-area">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(input) }}
              placeholder="Nhập tin nhắn..."
              disabled={isWaiting}
            />
            <button className="c-send" onClick={() => sendMessage(input)} disabled={isWaiting}>➤</button>
          </div>
          <div className="c-footer-txt">Powered by InterITS AI · Quoc Quan</div>
        </div>
      )}
    </>
  )
}