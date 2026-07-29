
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Techfo Analyzer" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
  
    return true;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw new Error("Email sending failed. Please try again.");
  }
};

export default sendEmail;







































// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: "Techfo Analyzer <onboarding@resend.dev>", 
//       to: [to],
//       subject: subject,
//       html: html,
//     });

//     if (error) {
//       console.error("❌ Resend API Error:", error);
//       throw new Error(error.message);
//     }

//     console.log("✅ Email sent successfully via Resend! ID:", data.id);
//     return true;
//   } catch (error) {
//     console.error("❌ Email Sending Failed:", error);
//     throw error;
//   }
// };

// export default sendEmail;


























// Forget Password Otp 



// export const sendForgetOtpEmail = async (toEmail, otp) => {
//   const subject = "Reset Your Password - TechfoAnalyzer";
//   const html = `
//     <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
//       <h2 style="color: #0f172a; text-align: center;">TechfoAnalyzer</h2>
//       <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
//       <p style="color: #334155; font-size: 15px;">Hello,</p>
//       <p style="color: #334155; font-size: 15px;">You requested to reset your password. Use the OTP code below to verify your account:</p>
      
//       <div style="text-align: center; margin: 25px 0;">
//         <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563eb; background: #eff6ff; padding: 10px 20px; border-radius: 8px; border: 1px dashed #bfdbfe;">
//           ${otp}
//         </span>
//       </div>

//       <p style="color: #64748b; font-size: 13px;">This code is valid for <b>10 minutes</b>. If you didn't request this, you can safely ignore this email.</p>
//     </div>
//   `;

//   // Apne existing sendEmail function ko yahan call karein
//   return await sendEmail({ to: toEmail, subject, html });
// };







































// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const { data, error } = await resend.emails.send({
//       // 🎯 Ab aapki official professional domain email use hogi!
//       from: "Techfo Analyzer <noreply@techfoanalyzer.com>",
//       to: [to],
//       subject: subject,
//       html: html,
//     });

//     if (error) {
//       console.error("❌ Resend API Error:", error);
//       throw new Error(error.message);
//     }

//     console.log("✅ Email sent from techfoanalyzer.com! ID:", data.id);
//     return true;
//   } catch (error) {
//     console.error("❌ Email Sending Failed:", error);
//     throw error;
//   }
// };

// export default sendEmail;