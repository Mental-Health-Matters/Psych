const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp, username) => {
  try {
    const subject = `Your OTP code is ${otp}`

    const text = `Hi ${username},

    Your OTP code is ${otp}.
    This code will expire in 10 minutes.

    If you did not request this, please ignore this email.

    Thank you,
    The Psych Team`

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