const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, NODE_ENV} = process.env;
const cloudinary = require('../utils/cloudinary');
const getDataUri = require('../utils/dataUri');
const CustomException = require('../utils/CustomException');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/mailService');
const otpMail = require('../utils/otpMail')
const saltRounds = 10;

const COOKIE_CONFIG = {
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: '/',
};

const authRegister = async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;

  // 1. Basic validation
  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(400).send({
      error: true,
      message: 'All fields are required!',
    });
  }

  // 2. Check if user already exists
  const existing = await User.findOne({
    $or: [{ email }, { username }]
  });
  
  if (existing) {
    return res.status(400).send({
      error: true,
      message: 'Email or Username already registered!',
    });
  }
  

  // 3. Must have uploaded file
  if (!req.file) {
    return res.status(400).send({
      error: true,
      message: 'Profile picture is required',
    });
  }

  try {
    // 4. Hash password
    const hash = await bcrypt.hash(password, saltRounds);

    // 5. Upload to Cloudinary
    const fileUri = getDataUri(req.file);
    const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
      resource_type: 'image',
    });
    if (!uploadResult?.secure_url) {
      throw CustomException('Unable to upload image to Cloudinary', 500);
    }

    // 6. Generate & send OTP
    const otp = generateOTP();
    const { subject, text } = otpMail(otp, username);
    const mail = await sendOTP(email, subject, text);
    if (!mail.success) {
      throw CustomException('Unable to send OTP', 500);
    }

    // 7. Create user with OTP fields
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hash,
      profilePicture: uploadResult.secure_url,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      authProvider: 'local',
    });

    await user.save();

    // 8. Success response
    return res.status(201).send({
      error: false,
      message: 'User registered successfully!',
      userId: user._id,
    });
  } catch (error) {
    console.error('Registration Error:', error);

    // Handle duplicate‐key errors (e.g. username collision)
    if (error.code === 11000) {
      return res.status(400).send({
        error: true,
        message: 'Username or email already in use!',
      });
    }

    // Generic fallback
    return res.status(error.status || 500).send({
      error: true,
      message: error.message || 'Something went wrong!',
    });
  }
};

const authLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      error: true,
      message: 'Email and password are required!',
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw CustomException('Check email or password!', 404);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw CustomException('Check email or password!', 401);
    }

    const { password: pwd, ...data } = user._doc;

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res
      .cookie('accessToken', token, COOKIE_CONFIG)
      .status(202)
      .send({
        error: false,
        message: 'Login successful!',
        user: data,
      });
  } catch ({ message, status = 500 }) {
    return res.status(status).send({
      error: true,
      message,
    });
  }
};



const authLogout = async (req, res) => {
  return res.clearCookie('accessToken', {
    sameSite: 'none',
    secure: true,
  }).send({
    error: false,
    message: 'User has been logged out!',
  });
};

const authStatus = async (req, res) => {
  const user = await User.findById(req.userID).select('-password');
  res.json({ error: false, user });
};

const verification = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    // Basic input validation
    if (!otp || !userId) {
      return res.status(400).json({ error: true, message: 'OTP and User ID are required.' });
    }

    const user = await User.findById(userId);

    // Check if user and OTP data exist
    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ error: true, message: 'OTP not set or expired.' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ error: true, message: 'Invalid OTP.' });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: true, message: 'OTP expired.' });
    }

    // Clear OTP fields
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Set token in cookie
    res.cookie('accessToken', token, COOKIE_CONFIG);

    return res.status(200).json({
      success: true,
      message: 'Email verified and user logged in.',
    });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: true, message: 'Internal server error.' });
  }
}


module.exports = {
    authRegister,
    authLogin,
    authLogout,
    authStatus,
    verification,
};
