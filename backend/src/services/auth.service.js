const crypto = require("crypto");

// In-memory token store (tokens are lost when the server restarts)
const tokens = new Map();

function generateToken(username) {
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, { username, createdAt: Date.now() });
  return token;
}

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  return tokens.get(token) || null;
}

module.exports = { generateToken, verifyToken };
