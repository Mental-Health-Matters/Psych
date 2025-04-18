function otpMail(otp, username) {
    const subject = `Your OTP code is ${otp}`

    const text = `Hi ${username},

    Your OTP code is ${otp}.
    This code will expire in 10 minutes.

    If you did not request this, please ignore this email.

    Thank you,
    The Psych Team`
    return {subject, text}
}

module.exports = otpMail