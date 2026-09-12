const nodemailer = require('nodemailer');
const ENV = require('../config/env');

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: false,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: ENV.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

module.exports = { sendEmail };
