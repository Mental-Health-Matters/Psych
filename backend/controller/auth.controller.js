const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, NODE_ENV, GOOGLE_CLIENT_ID } = process.env;
const cloudinary = require('../utils/cloudinary');
const getDataUri = require('../utils/dataUri');
const CustomException = require('../utils/CustomException');
const generateOTP = require('../utils/generateOTP');
const sendOTP = require('../utils/mailService');
const otpMail = require('../utils/otpMail')
const saltRounds = 10;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the ID token with Google OAuth2
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    // Get user profile from Google payload
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Generate username by combining first and last names
    const username = `${given_name}${family_name}`;

    // Check if the user already exists in the database
    let user = await User.findOne({ email });
    if (!user) {
      // If the user doesn't exist, create a new user in the database
      user = await User.create({
        email,
        name: `${given_name} ${family_name}`,
        profilePicture: picture,
        username: username,  // Store the generated username
        password: null,
        authProvider: "google",  // Specify the provider as 'google'
      });
    }

    // Remove password and send user data with the JWT token
    const { password, ...data } = user._doc;
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie and send response
    const cookieConfig = {
      httpOnly: true,
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
      secure: NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
      path: '/',
    };

    return res
      .cookie('accessToken', token, cookieConfig)  // Set the access token in the cookie
      .status(200)
      .json({ user: data });  // Send user data as response
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google login failed" });
  }
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
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).send({
      error: true,
      message: 'Email already registered!',
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

    const cookieConfig = {
      httpOnly: true,
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
      secure: NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    return res
      .cookie('accessToken', token, cookieConfig)
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
  const {username, otp} = req.body
  const user = await User.findOne({username})

  console.log(user)
  if (!user || !user.otp || !user.otpExpiresAt) {
    return res.status(400).send({ error: true, message: "OTP not set or expired!" });
  }
  
  if (user.otp !== otp) {
    return res.status(400).send({ error: true, message: "Invalid OTP!" });
  }
  
  if (user.otpExpiresAt < new Date()) {
    return res.status(400).send({ error: true, message: "OTP expired!" });
  }

  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res
    .cookie('accessToken', token, COOKIE_CONFIG)
    .send({ error: false, message: 'Email verified—logged in!', user: { ...user._doc, password: undefined } });

  return res.send({ error: false, message: "OTP verified successfully!" });
}


module.exports = {
    authRegister,
    authLogin,
    authLogout,
    authStatus,
    verification,
    googleLogin
};
