const nodemailer = require("nodemailer");

// ─────────────────────────────────────────
// Cấu hình Gmail
// ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────
// Gửi email thông báo lead mới
// ─────────────────────────────────────────
async function sendLeadNotification(lead, sessionId) {
  const now = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const mailOptions = {
    from: `"InterITS Chatbot" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `🔔 [LEAD MỚI] ${lead.ten} - ${lead.cong_ty}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #00a79d, #00857c); padding: 24px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 22px;">🔔 LEAD MỚI TỪ CHATBOT</h2>
          <p style="color: #b2f0ed; margin: 8px 0 0;">InterITS AI Assistant</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; width: 40%;">👤 Họ tên</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; color: #333;">${lead.ten}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">🏢 Công ty</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">${lead.cong_ty}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">📞 Số điện thoại</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">
                <a href="tel:${lead.sdt}" style="color: #00a79d; font-weight: bold;">${lead.sdt}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">📧 Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">
                <a href="mailto:${lead.email}" style="color: #00a79d;">${lead.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;">🎯 Sản phẩm quan tâm</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #333;">
                <span style="background: #e8f8f7; color: #00857c; padding: 3px 10px; border-radius: 12px; font-size: 13px;">
                  ${lead.san_pham || "Chưa xác định"}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">⏰ Thời gian</td>
              <td style="padding: 10px 0; color: #333;">${now}</td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="padding: 20px 24px; background: #f8f9fa; text-align: center; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; margin: 0 0 12px; font-size: 14px;">
            👉 Vui lòng liên hệ khách hàng trong vòng <strong>30 phút</strong>!
          </p>
          <a href="mailto:${lead.email}" 
             style="background: #00a79d; color: white; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">
            ✉️ Gửi email cho khách
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 14px; text-align: center; background: #222429;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            InterITS Chatbot System · Session: ${sessionId}
          </p>
        </div>

      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Đã gửi thông báo lead đến ${process.env.EMAIL_TO}`);
    return true;
  } catch (err) {
    console.error("[EMAIL ERROR]", err.message);
    return false;
  }
}

module.exports = { sendLeadNotification };
