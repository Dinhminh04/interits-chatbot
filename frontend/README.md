# InterITS Chatbot - React Frontend

## Cấu trúc

```
interits-chatbot/
├── frontend/                    ← React app (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx         ← Trang chủ + chat widget
│   │   │   └── Admin.jsx        ← Trang admin
│   │   ├── components/
│   │   │   ├── ChatWidget.jsx   ← Chat widget component
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Leads.jsx
│   │   │       ├── Conversations.jsx
│   │   │       └── SystemPrompt.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── server.js
├── chatbot.js
├── database.js
├── email.js
└── .env
```

## Cài đặt và chạy

### Bước 1: Cài dependencies frontend
```bash
cd frontend
npm install
```

### Bước 2: Chạy development mode (có hot reload)
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```
Mở http://localhost:5173 để xem trang chủ
Mở http://localhost:5173/admin để vào trang Admin

### Bước 3: Build production
```bash
cd frontend
npm run build
```
File build ra thư mục `public/` — server.js sẽ serve tự động.

## Routes
- `/` → Trang chủ InterITS + Chat Widget
- `/admin` → Trang quản trị Admin

## Tài khoản Admin mặc định
- Username: admin
- Password: admin123