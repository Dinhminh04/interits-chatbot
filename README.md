# InterITS Chatbot v2.0
## LangChain + Gemini + MySQL + Zalo OA

---

## 🗂️ Cấu trúc project

```
chatbot/
├── server.js      ← Express server (API endpoint)
├── chatbot.js     ← LangChain + Gemini (xử lý AI)
├── database.js    ← MySQL XAMPP (lưu trữ)
├── zalo.js        ← Zalo OA (gửi thông báo)
├── index.html     ← Frontend chatbot widget
├── .env           ← Cấu hình (API key, DB...)
├── package.json   ← Dependencies
└── README.md
```

---

## 🚀 Cài đặt và chạy

### Bước 1: Cài Node.js dependencies
```bash
npm install
```

### Bước 2: Bật XAMPP
- Mở XAMPP Control Panel
- Start **Apache** và **MySQL**
- Vào phpMyAdmin (http://localhost/phpmyadmin)
- Tạo database mới tên: `interits_chatbot`
- (Không cần tạo bảng, hệ thống tự tạo khi chạy)

### Bước 3: Cấu hình .env
```env
GEMINI_API_KEY=your_gemini_api_key   # Lấy tại aistudio.google.com
ZALO_OA_TOKEN=your_zalo_oa_token     # Lấy tại developers.zalo.me
ZALO_USER_ID=your_zalo_user_id       # User ID Zalo của mày
```

### Bước 4: Chạy server
```bash
# Development (auto restart khi sửa code)
npm run dev

# Production
npm start
```

### Bước 5: Mở chatbot
- Mở file `index.html` trong trình duyệt
- Hoặc để Apache (XAMPP) serve file này

---

## 📱 Cách lấy Zalo User ID

1. Đăng ký Zalo OA tại: https://oa.zalo.me (chọn "Cá nhân")
2. Tạo app tại: https://developers.zalo.me → lấy **Access Token**
3. Mày (nhân viên) dùng Zalo cá nhân → **follow OA** đó
4. Vào OA Manager → Người quan tâm → copy **user_id** của mày
5. Điền vào `.env`

---

## 🔗 API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | /chat | Gửi tin nhắn chatbot |
| GET | /history/:session_id | Lấy lịch sử hội thoại |
| GET | /admin/leads | Xem danh sách leads |

### Ví dụ gọi API:
```bash
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test123","message":"Callbot là gì?"}'
```

---

## 🗄️ Database (tự động tạo)

- **conversations** — Phiên hội thoại
- **messages** — Tin nhắn (user + assistant)
- **leads** — Khách hàng tiềm năng

---
