import nodemailer from 'nodemailer';

const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

let transporter = null;
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Sends an email when SMTP is configured. In development, when no SMTP
 * credentials are present, the email is simply logged to the console so
 * flows like "forgot password" remain fully testable without real SMTP.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log('--------------------------------------------------');
    console.log('SMTP not configured - email output (dev mode):');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log('--------------------------------------------------');
    return { simulated: true };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@shopwave.dev',
    to,
    subject,
    html,
    text,
  });

  return info;
};

export default sendEmail;
