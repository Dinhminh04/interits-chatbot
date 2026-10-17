const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoutes = require("./routes/chat.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Serve React build (backend/public/) ───
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// ─── API routes ───
app.use("/", chatRoutes);
app.use("/admin", adminRoutes);

// ─── Fallback to the React app (must stay last) ───
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

module.exports = app;
