const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SEND,
    pass: process.env.CODE_MAIL,
  },
});

async function sendMail(message, receiveur, subject) {
  const mailOptions = {
    from: process.env.MAIL_SEND,
    to: process.env.MAIL_REV,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Mail envoyé à", process.env.MAIL_REV);
  } catch (err) {
    console.error('❌ Erreur envoi mail :', err);
  }
}

module.exports = sendMail;
