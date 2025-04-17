const express = require('express');
// const { userMiddleware } = require('../middlewares');
const { deleteUser, updateProfile } = require('../controller/user.controller');

const router = express.Router();

router.delete('/', deleteUser);

router.patch('/', authenticate, updateProfile)
module.exports = app;