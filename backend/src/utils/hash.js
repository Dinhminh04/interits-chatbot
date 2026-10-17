const crypto = require("crypto");

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password + "interits_salt_2026")
    .digest("hex");
}

module.exports = { hashPassword };
