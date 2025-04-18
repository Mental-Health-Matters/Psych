const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Psych" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
    });
    return { success: true, info };

  } catch (error) {
    return { success: false, error };
  }
};

module.exports = sendOTP