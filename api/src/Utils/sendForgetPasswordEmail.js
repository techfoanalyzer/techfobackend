import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendForgetPasswordEmail = async (toEmail, otp) => {
  try {
    const subject = "Reset Your Password - TechfoAnalyzer";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a; text-align: center;">TechfoAnalyzer</h2>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p style="color: #334155; font-size: 15px;">Hello,</p>
        <p style="color: #334155; font-size: 15px;">You requested to reset your password. Use the OTP code below to verify your account:</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563eb; background: #eff6ff; padding: 10px 20px; border-radius: 8px; border: 1px dashed #bfdbfe;">
            ${otp}
          </span>
        </div>

        <p style="color: #64748b; font-size: 13px;">This code is valid for <b>10 minutes</b>. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    const mailOptions = {
      from: `"TechfoAnalyzer" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Forget Password OTP Email Sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer Email Error:", error);
    throw new Error("Failed to send forget password email.");
  }
};