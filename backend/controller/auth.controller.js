const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, NODE_ENV} = process.env;
const cloudinary = require('../utils/cloudinary');
const getDataUri = require('../utils/dataUri');
const CustomException = require('../utils/CustomException');
const generateOTP = require('../utils/generateOTP');
const emailQueue = require('../utils/emailQueue'); // New Bull queue
const sendOTP = require('../utils/mailService'); // Make sure this import is correct
const otpMail = require('../utils/otpMail'); // Make sure this import is correct
const saltRounds = 10;

// server/config/cookieConfig.js
const COOKIE_CONFIG = {
  httpOnly: process.env.NODE_ENV === 'production', // JS can read cookie in dev
  secure: process.env.NODE_ENV === 'production',   // require HTTPS in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.psych-9vpb.onrender.com' : undefined,
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

  try {
    // 2. Check if user already exists (with optimized query)
    const existing = await User.findOne({
      $or: [{ email }, { username }]
    }).lean().select('_id'); // Use lean() for faster queries
    
    if (existing) {
      return res.status(400).send({
        error: true,
        message: 'Email or Username already registered!',
      });
    }

    // 3. Hash password asynchronously but don't wait
    const hashPromise = bcrypt.hash(password, saltRounds);
    
    // 4. Handle file upload (make it optional for faster registration)
    let profilePictureUrl = null;
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        // Use Promise.race to timeout cloudinary upload
        const uploadPromise = cloudinary.uploader.upload(fileUri.content, {
          resource_type: 'image',
          public_id: `user_profiles/${username}`, // fixed ID (user-specific)
          overwrite: true,                       // replaces old image
          invalidate: true,                        // clears cached version
          timeout: 10000, // 10 second timeout
        });
        
        const uploadResult = await Promise.race([
          uploadPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout')), 10000)
          )
        ]);
        
        profilePictureUrl = uploadResult?.secure_url;
      } catch (uploadError) {
        console.warn('Image upload failed, proceeding without profile picture:', uploadError);
        // Continue registration without profile picture
      }
    }

    // 5. Wait for password hash to complete
    const hashedPassword = await hashPromise;

    // 6. Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp); // Debug log

    // 7. Create user first (fast database operation)
    const user = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
      otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      authProvider: 'local',
    });

    console.log('User saved with OTP:', user.otp); // Debug log

    // 8. Try to send email immediately first, then queue as backup
    let emailSent = false;
    let emailError = null;
    
    try {
      const { subject, text } = otpMail(otp, username);
      console.log('Email subject:', subject); // Debug log
      console.log('Email text:', text); // Debug log
      console.log('Sending to email:', email); // Debug log
      
      const emailResult = await Promise.race([
        sendOTP(email, subject, text),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email timeout')), 15000) // Increased timeout
        )
      ]);
      
      console.log('Email result:', emailResult); // Debug log
      
      if (emailResult && emailResult.success) {
        emailSent = true;
        console.log('Email sent successfully!');
      } else {
        console.log('Email failed with result:', emailResult);
        emailError = emailResult?.error || 'Unknown email error';
      }
    } catch (emailErr) {
      console.error('Direct email send failed:', emailErr);
      emailError = emailErr.message;
    }

    // 9. If direct email failed, queue it
    if (!emailSent) {
      console.log('Queuing email due to failure:', emailError);
      try {
        await emailQueue.add('sendOTP', {
          email,
          otp,
          username,
          userId: user._id
        }, {
          attempts: 3,
          backoff: 'exponential',
          delay: 2000
        });
        console.log('Email queued successfully');
      } catch (queueError) {
        console.error('Failed to queue email:', queueError);
      }
    }

    await user.save();
    
    // 10. Return success immediately with debug info
    return res.status(201).send({
      error: false,
      message: emailSent ? 'User registered successfully! OTP sent to email.' : 'User registered successfully! OTP will be sent shortly.',
      userId: user._id,
      emailSent,
      // Include debug info in development
      ...(NODE_ENV === 'development' && {
        debug: {
          otpGenerated: !!otp,
          emailError: emailError,
          emailAddress: email
        }
      })
    });

  } catch (error) {
    console.error('Registration Error:', error);

    // Handle duplicate‐key errors
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
    const user = await User.findOne({ email }).lean(); // Use lean() for faster queries

    if (!user) {
      throw CustomException('Check email or password!', 404);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw CustomException('Check email or password!', 401);
    }

    const { password: pwd, ...data } = user;

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
  const user = await User.findById(req.userID).select('-password').lean();
  res.json({ error: false, user });
};

const verification = async (req, res) => {
  try {
    const { otp, userId } = req.body;

    if (!otp || !userId) {
      return res.status(400).json({ error: true, message: 'OTP and User ID are required.' });
    }

    const user = await User.findById(userId);

    if (!user || !user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ error: true, message: 'OTP not set or expired.' });
    }

    console.log('Stored OTP:', user.otp, 'Provided OTP:', otp); // Debug log

    if (user.otp !== otp) {
      return res.status(400).json({ error: true, message: 'Invalid OTP.' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: true, message: 'OTP expired.' });
    }

    // Clear OTP fields
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

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

// Enhanced resend OTP with better error handling
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log('Resending OTP:', otp, 'to email:', user.email); // Debug log

    // Try direct send first
    let emailSent = false;
    try {
      const { subject, text } = otpMail(otp, user.username);
      const emailResult = await sendOTP(user.email, subject, text);
      
      if (emailResult && emailResult.success) {
        emailSent = true;
      }
    } catch (emailError) {
      console.error('Direct OTP resend failed:', emailError);
    }

    // Queue if direct send failed
    if (!emailSent) {
      await emailQueue.add('sendOTP', {
        email: user.email,
        otp,
        username: user.username,
        userId: user._id
      }, {
        attempts: 3,
        backoff: 'exponential',
        delay: 2000
      });
    }

    res.status(200).json({
      error: false,
      message: 'OTP resent successfully!',
      emailSent
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: true, message: 'Internal server error.' });
  }
};

module.exports = {
    authRegister,
    authLogin,
    authLogout,
    authStatus,
    verification,
    resendOTP,
};