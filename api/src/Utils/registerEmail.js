import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const registeredsendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Missing required email parameters: 'to', 'subject', or 'html'.");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Techfo Analyzer <noreply@techfoanalyzer.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      throw new Error(error.message || "Failed to send email via Resend.");
    }

    console.log("✅ Email sent successfully! ID:", data?.id);
    return data;
  } catch (error) {
    console.error("❌ Email Sending Failed:", error.message || error);
    throw error;
  }
};

export default registeredsendEmail;

