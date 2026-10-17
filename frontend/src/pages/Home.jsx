import ChatWidget from '../components/ChatWidget.jsx'

export default function Home() {
  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="container">
          <a href="https://interits.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://interits.com/wp-content/uploads/2021/03/logo_its.jpg" alt="Inter ITS" style={{height:'58px',width:'auto'}} />
          </a>
          <nav>
            <a href="https://interits.com/" target="_blank" rel="noopener noreferrer">Trang chủ</a>
            <a href="https://interits.com/gioi-thieu-its/" target="_blank" rel="noopener noreferrer">Giới thiệu</a>
            <a href="https://interits.com/giai-phap/" target="_blank" rel="noopener noreferrer">Giải pháp</a>
            <a href="https://interits.com/tin-tuc/" target="_blank" rel="noopener noreferrer">Tin tức</a>
            <a href="https://interits.com/lien-he/" target="_blank" rel="noopener noreferrer">Liên hệ</a>
            <a href="tel:0962510256" className="btn-hotline">HOTLINE</a>
          </nav>
        </div>
        <div className="accent-bar"></div>
      </header>

      {/* HERO */}
      <div className="hero">
        <img src="https://interits.com/wp-content/uploads/2025/01/IMG_9178.jpeg" alt="Banner InterITS" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h2>ĐOÀN KẾT</h2>
          <h3>Sức mạnh của chúng tôi</h3>
          <p>Chúng tôi tin rằng, khi mỗi thành viên trong công ty đều hướng tới mục tiêu chung, chúng ta có thể vượt qua mọi thách thức.</p>
          <a href="https://interits.com/gioi-thieu/" target="_blank" rel="noopener noreferrer" className="btn">Xem thêm</a>
        </div>
      </div>

      {/* STAT BAR */}
      <div className="stat-bar">
        <div className="container">
          {[
            { num: '500+', lbl: 'Khách hàng doanh nghiệp' },
            { num: '10+', lbl: 'Năm kinh nghiệm' },
            { num: '15+', lbl: 'Giải pháp công nghệ' },
            { num: '99.9%', lbl: 'Uptime SLA' },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GIẢI PHÁP CNTT */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Giải pháp công nghệ thông tin</h2>
            <p>Các giải pháp Công nghệ thông tin nổi bật của Inter ITS</p>
          </div>
          <div className="product-grid">
            {[
              { href: 'https://interits.com/giai-phap/callbot-tong-dai-tu-van-vien-ao/', img: 'https://interits.com/wp-content/uploads/2021/04/callbot2.jpg', label: '🤖 Callbot – Tổng đài tư vấn viên ảo' },
              { href: 'https://interits.com/giai-phap/giai-phap-tong-dai-contact-center/', img: 'https://interits.com/wp-content/uploads/2023/03/contact-center-its.png', label: '🎧 Giải pháp tổng đài Contact Center' },
              { href: 'https://interits.com/giai-phap/ekyc-dinh-danh-khach-hang-dien-tu/', img: 'https://interits.com/wp-content/uploads/2021/04/ekyc.jpg', label: '🛡️ eKYC – Định danh khách hàng điện tử' },
              { href: 'https://interits.com/giai-phap/giai-phap-its-chatbot/', img: 'https://interits.com/wp-content/uploads/2021/03/logo_its.jpg', label: '💬 Giải pháp ITS Chatbot' },
              { href: 'https://interits.com/giai-phap/voice-biometrics-xac-thuc-giong-noi/', img: 'https://interits.com/wp-content/uploads/2021/04/voicebio.jpg', label: '🎤 Voice Biometrics – Xác thực giọng nói' },
              { href: 'https://interits.com/giai-phap/hop-dong-dien-tu-fcontract/', img: 'https://interits.com/wp-content/uploads/2021/12/fcontract1.jpg', label: '📄 Hợp đồng điện tử FContract' },
            ].map((p, i) => (
              <a href={p.href} target="_blank" rel="noopener noreferrer" key={i}>
                <div className="product-card">
                  <img src={p.img} alt={p.label} />
                  <div className="card-label">{p.label}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* GIẢI PHÁP VIỄN THÔNG */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title">
            <h2>Giải pháp viễn thông</h2>
            <p>Các giải pháp core viễn thông nổi bật của Inter ITS</p>
          </div>
          <div className="product-grid">
            {[
              { href: 'https://interits.com/vien-thong/mobile-sip-trunking/', img: 'https://interits.com/wp-content/uploads/2021/04/mobile-sip-trunking.jpeg', label: '📡 SIP Trunking – Hạ tầng thoại doanh nghiệp' },
              { href: 'https://interits.com/vien-thong/he-thong-voice-brandname/', img: 'https://interits.com/wp-content/uploads/2021/04/voice-brandname.jpeg', label: '🔔 Voice Brandname – Hiển thị thương hiệu' },
              { href: 'https://interits.com/vien-thong/data-sponsor/', img: 'https://interits.com/wp-content/uploads/2021/04/Data-sponsor.jpg', label: '📊 Hệ thống Data Sponsor' },
            ].map((p, i) => (
              <a href={p.href} target="_blank" rel="noopener noreferrer" key={i}>
                <div className="product-card">
                  <img src={p.img} alt={p.label} />
                  <div className="card-label">{p.label}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ĐỐI TÁC */}
      <section className="section">
        <div className="container">
          <div className="section-title"><h2>Đối tác</h2></div>
          <div className="partner-logos">
            {[
              'https://interits.com/wp-content/uploads/2025/04/Viettel_logo_2021.svg.png',
              'https://interits.com/wp-content/uploads/2025/04/MobiFone-1.png',
              'https://interits.com/wp-content/uploads/2025/04/Vinaphone-1.png',
              'https://interits.com/wp-content/uploads/2025/04/Vietnam_Television_logo_from_2013.svg.png',
              'https://interits.com/wp-content/uploads/2025/04/LOGO-TIEN-PHONG-1.png',
            ].map((src, i) => <img src={src} key={i} alt={`Partner ${i}`} />)}
          </div>
        </div>
      </section>

      {/* TIN TỨC */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-title"><h2>Tin tức - bài viết</h2></div>
          <div className="news-grid">
            {[
              { href: 'https://interits.com/vu-gia-luyen-guong-mat-tre-viet-nam-tieu-bieu-2021/', img: 'https://interits.com/wp-content/uploads/2022/03/Guong-mat-tieu-bieu.jpg', title: 'Tổng giám đốc Vũ Gia Luyện – Gương mặt trẻ Việt Nam tiêu biểu 2021', desc: 'Tháng 3-2022, Tổng giám đốc Vũ Gia Luyện đã vinh dự nhận giải thưởng...' },
              { href: 'https://interits.com/tgd-vu-gia-luyen-dai-bieu-hdnd-tp-ha-noi-2026-2031/', img: 'https://interits.com/wp-content/uploads/2026/03/z7508715199531_2d8ba69200757ff191e9c669d2817bb1-1.jpg', title: 'TGĐ Vũ Gia Luyện trúng cử Đại biểu HĐND TP Hà Nội nhiệm kỳ 2026-2031', desc: 'Ngày 20-3-2026, Ủy ban Bầu cử thành phố Hà Nội công bố kết quả...' },
              { href: 'https://interits.com/lanh-dao-its-tai-hoi-nghi-nghi-sy-tre-toan-cau/', img: 'https://interits.com/wp-content/uploads/2023/09/check.jpg', title: 'Lãnh đạo ITS trình bày tham luận tại Hội nghị Nghị sỹ trẻ toàn cầu 2023', desc: 'Sáng ngày 14-9-2023, anh Vũ Gia Luyện – Founder của Công Ty ITS đã tham gia...' },
            ].map((n, i) => (
              <a href={n.href} target="_blank" rel="noopener noreferrer" key={i}>
                <div className="news-card">
                  <img src={n.img} alt={n.title} />
                  <div className="news-body">
                    <h5>{n.title}</h5>
                    <p>{n.desc}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <img src="https://interits.com/wp-content/uploads/2021/03/logo_its_white.png" alt="Inter ITS" style={{height:'48px',marginBottom:'16px'}} />
              <div className="info-item">📍 Tầng 03, N01-T3, Ngoại Giao Đoàn, Hà Nội</div>
              <div className="info-item">📞 <a href="tel:0962510256" style={{color:'#c0c0c0'}}>0962510256</a></div>
              <div className="info-item">✉️ <a href="mailto:info@interits.com" style={{color:'#c0c0c0'}}>info@interits.com</a></div>
            </div>
            <div className="footer-col">
              <h3>Giải pháp CNTT</h3>
              <ul>
                <li><a href="https://interits.com/giai-phap/callbot-tong-dai-tu-van-vien-ao/" target="_blank" rel="noopener noreferrer">Callbot</a></li>
                <li><a href="https://interits.com/giai-phap/giai-phap-tong-dai-contact-center/" target="_blank" rel="noopener noreferrer">Contact Center</a></li>
                <li><a href="https://interits.com/giai-phap/ekyc-dinh-danh-khach-hang-dien-tu/" target="_blank" rel="noopener noreferrer">eKYC</a></li>
                <li><a href="https://interits.com/giai-phap/giai-phap-its-chatbot/" target="_blank" rel="noopener noreferrer">ITS Chatbot</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Giải pháp viễn thông</h3>
              <ul>
                <li><a href="https://interits.com/vien-thong/mobile-sip-trunking/" target="_blank" rel="noopener noreferrer">SIP Trunking</a></li>
                <li><a href="https://interits.com/vien-thong/he-thong-voice-brandname/" target="_blank" rel="noopener noreferrer">Voice Brandname</a></li>
                <li><a href="https://interits.com/vien-thong/data-sponsor/" target="_blank" rel="noopener noreferrer">Data Sponsor</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Liên kết</h3>
              <ul>
                <li><a href="https://interits.com/lien-he/" target="_blank" rel="noopener noreferrer">Liên hệ</a></li>
                <li><a href="https://interits.com/tin-tuc/" target="_blank" rel="noopener noreferrer">Tin tức</a></li>
                <li><a href="https://www.facebook.com/interitssolutionco/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                <li><a href="https://www.linkedin.com/company/interits" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">Copyright 2021 © Inter ITS., JSC. All Rights Reserved.</div>
      </footer>

      {/* CHAT WIDGET */}
      <ChatWidget />
    </>
  )
}