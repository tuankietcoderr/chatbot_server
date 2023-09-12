const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

function mailOptions({ to, subject, text }) {
  return {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };
}

function sendMail({ to, subject, text }) {
  return transporter.sendMail(mailOptions({ to, subject, text }));
}

module.exports = { sendMail };
