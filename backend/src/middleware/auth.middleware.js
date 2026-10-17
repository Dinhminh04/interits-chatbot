const { verifyToken } = require("../services/auth.service");

function requireAuth(req, res, next) {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.adminUser = user;
  next();
}

module.exports = { requireAuth };
