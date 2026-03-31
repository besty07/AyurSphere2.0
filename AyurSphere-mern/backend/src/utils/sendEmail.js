import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // This configures standard Google SMTP parameters automatically
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // This must be the 16-character App Password, not the standard Google password.
    },
  });

  const message = {
    from: `"AyurSphere Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(message);
  console.log(`[Email Sent] Message ID: ${info.messageId}`);
};
