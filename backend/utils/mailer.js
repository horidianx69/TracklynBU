import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // shortcut for smtp.gmail.com
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Tracklyn APP" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}
