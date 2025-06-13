const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eliseeadan@gmail.com',
    pass: 'nlbk tpkm mtqe uokn',
  },
});

async function sendMail(message, receiveur, subject) {
  const mailOptions = {
    from: 'eliseeadan@gmail.com',
    to: 'missconcourshounmanbou@gmail.com',
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Mail envoyé à", 'deograciaszoungni@gmail.com');
  } catch (err) {
    console.error('❌ Erreur envoi mail :', err);
  }
}

module.exports = sendMail;
