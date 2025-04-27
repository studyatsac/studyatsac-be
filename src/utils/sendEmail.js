const formData = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // API Key dari Mailgun
});

async function sendResetPasswordEmail(to, token) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from: `STUDYATSAC <no-reply@${process.env.MAILGUN_DOMAIN}>`,
    to,
    subject: "Reset Password Anda",
    html: `<p>Halo,</p>
               <p>Kami menerima permintaan untuk mereset password Anda.</p>
               <p>Klik link berikut untuk mengatur ulang password Anda:</p>
               <a href="${resetLink}">${resetLink}</a>
               <p>Jika Anda tidak merasa meminta, abaikan email ini.</p>`,
  });
}

module.exports = sendResetPasswordEmail;
