const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, NODE_ENV, GOOGLE_CLIENT_ID } = process.env;
const cloudinary = require('../utils/cloudinary');
const getDataUri = require('../utils/dataUri');
const CustomException = require('../utils/CustomException');
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

  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(400).send({
      error: true,
      message: 'All fields are required!',
    });
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    if (!req.file) {
      throw CustomException('Profile picture is required', 400);
    }

    const fileUri = getDataUri(req.file);
    const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
      resource_type: 'image',
    });

    if (!uploadResult?.secure_url) {
      throw CustomException('Unable to upload image to Cloudinary', 500);
    }

    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hash,
      profilePicture: uploadResult.secure_url,
    });

    await user.save();
    console.log(uploadResult.secure_url);
    return res.status(201).send({
      error: false,
      message: 'User registered successfully!',
      userId: user._id,
    });
  } catch (error) {
    console.error('Registration Error:', error);

    if (error.message.includes('E11000')) {
      return res.status(400).send({
        error: true,
        message: 'Email already registered!',
      });
    }

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

    const token = jwt.sign(
      { _id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieConfig = {
      httpOnly: true,
      sameSite: NODE_ENV === 'production' ? 'none' : 'strict',
      secure: NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
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

module.exports = {
  authRegister,
  authLogin,
  authLogout,
  googleLogin,
};
