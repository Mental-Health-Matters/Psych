const express = require('express');
const { authLogin, authLogout, authRegister, authStatus, verification, googleLogin } = require('../controller/auth.controller');
const upload = require('../middleware/multer.middleware');
const authenticate = require('../middleware/authenticate.middleware')
const router = express.Router();

// Register
router.post('/register', upload.single('profilePicture'), authRegister);

//Verify OTP
router.post('/verify-otp', verification)

// Login
router.post('/login', authLogin);

// Logout
router.post('/logout', authLogout);

// Google Login
// router.post('/googlelogin', googleLogin);

router.get('/me', authenticate, authStatus);

module.exports = router;
