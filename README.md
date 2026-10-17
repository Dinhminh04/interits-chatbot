# InterITS Chatbot

A demo AI sales consultant chatbot that answers questions about an IT company's products, remembers the conversation, and turns interested visitors into sales leads.

## Description

### What the application does

Visitors open the chat widget on the website and ask about the company's products (callbot, voicebot, chatbot and other AI solutions). The bot answers based on a product catalog written in the system prompt and remembers what was said earlier in the chat.

When a visitor shares their name, company, phone number and email, the bot saves them as a sales lead and sends an email alert to the sales team.

Admins log in to a dashboard to see statistics, manage leads by status, read past conversations and edit the system prompt directly, with no need to restart the server.

This is a personal learning project. The company content is used for demo purposes only and is not connected to any real company data.

### Why these technologies

- **LangChain:** manages the prompt template and per-session conversation memory, so I did not have to build chat history handling by hand.
- **Gemini API:** generates natural replies in Vietnamese; the `flash-lite` model is fast and cheap enough for a chatbot.
- **Node.js + Express:** a simple REST API server, and the same language (JavaScript) as the frontend.
- **MySQL:** stores conversations, messages, leads, admin accounts and the system prompt.
- **React + Vite:** fast development setup for the chat widget and the admin dashboard.
- **Nodemailer:** sends lead alerts through Gmail.

### Challenges

- **Getting structured data out of free text:** the prompt tells Gemini to add a hidden tag `##LEAD##name|company|phone|email|product##END##` once it has all the details. The server reads this tag with a regular expression, saves the lead, and removes the tag before showing the reply.
- **Memory after a restart:** LangChain memory lives in RAM and is lost when the server restarts, so the last 10 messages are reloaded from MySQL into memory when a session continues.
- **Changing the bot's behavior without redeploying:** the system prompt is stored in the database; when an admin saves a new prompt, all cached chains are cleared and rebuilt with it.

### Future features

- Replace SHA-256 password hashing with bcrypt, and in-memory tokens with JWT
- Answer from company documents (PDF, Word) using RAG instead of a fixed prompt
- Zalo and Facebook Messenger integration
- Docker setup for easier deployment

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Installation and Running](#installation-and-running)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Author](#author)

## Tech Stack

| Layer | Technology |
|---|---|
| AI | LangChain, Google Gemini API (gemini-2.5-flash-lite) |
| Backend | Node.js, Express |
| Database | MySQL |
| Frontend | React 18, Vite, React Router, Chart.js |
| Email | Nodemailer (Gmail) |

## Installation and Running

### Requirements

- Node.js 18 or later
- MySQL (for example via XAMPP)
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- A Gmail account with an App Password (for lead emails)

### Step 1: Clone the repository

```bash
git clone https://github.com/Dinhminh04/interits-chatbot.git
cd interits-chatbot
```

### Step 2: Create the database

Create an empty MySQL database named `interits_chatbot`. The tables are created automatically when the server starts.

### Step 3: Set up the backend

```bash
npm install
```

Create a `.env` file in the root folder:

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=interits_chatbot

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=sales_team_email@gmail.com
```

### Step 4: Run the backend

```bash
npm run dev
```

The API runs at `http://localhost:3001`.

### Step 5: Set up and run the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Requests to `/api` are forwarded to the backend.

On the first start, a default admin account is created: `admin` / `admin123`. Change it after logging in.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/preview` | Preview the current system prompt |
| POST | `/chat` | Send a message and get the bot's reply |
| GET | `/history/:session_id` | Get the chat history of a session |
| POST | `/admin/login` | Admin login |
| GET | `/admin/stats` | Dashboard statistics |
| GET | `/admin/leads` | List leads |
| PUT | `/admin/leads/:id/status` | Update a lead's status |
| GET | `/admin/conversations` | List conversations |
| DELETE | `/admin/conversations/:session_id` | Delete a conversation |
| GET | `/admin/prompt` | Get the system prompt |
| PUT | `/admin/prompt` | Update the system prompt |

All `/admin/*` routes except login require a Bearer token.

## Project Structure

```
interits-chatbot/
├── server.js        # Express server and API routes
├── chatbot.js       # LangChain + Gemini: prompt, memory, lead extraction
├── database.js      # MySQL connection, tables and queries
├── email.js         # Lead alert emails (Nodemailer)
└── frontend/        # React + Vite
    └── src/
        ├── components/
        │   ├── ChatWidget.jsx
        │   └── admin/   # Dashboard, Leads, Conversations, SystemPrompt
        └── pages/       # Home, Admin
```

## Author

Nguyen Dinh Minh — [github.com/Dinhminh04](https://github.com/Dinhminh04)
