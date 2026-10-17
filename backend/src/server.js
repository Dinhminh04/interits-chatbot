const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { initDB } = require("./config/db");

const PORT = process.env.PORT || 3001;

async function start() {
  // Create tables first, then load the app (the chatbot reads the prompt from the DB on load)
  await initDB();
  const app = require("./app");

  app.listen(PORT, () => {
    console.log(
      `✅ InterITS Chatbot Server đang chạy tại http://localhost:${PORT}`,
    );
  });
}

start();
