import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const registeredsendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      
      from: "Techfo Analyzer <noreply@techfoanalyzer.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent from techfoanalyzer.com! ID:", data.id);
    return true;
  } catch (error) {
    console.error("❌ Email Sending Failed:", error);
    throw error;
  }
};

export default registeredsendEmail;