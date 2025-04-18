const express = require('express');
const authController = require('../controller/auth.controller');
const router = express.Router(); // ✅ Move this to the top before router.post

const {
  authLogin,
  authLogout,
  authRegister,
  authStatus,
  googleLogin, // ✅ Import googleLogin
} = require('../controller/auth.controller');

const upload = require('../middleware/multer.middleware');
const authenticate = require('../middleware/authenticate.middleware');

// Register
router.post('/register', upload.single('profilePicture'), authRegister, authController.authRegister);

// Login
router.post('/login', authLogin);



// Logout
router.post('/logout', authLogout);

// ✅ Google Login
router.post('/googlelogin', authController.googleLogin);

// router.get('/me', authenticate, authStatus);

module.exports = router;
