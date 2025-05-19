const express = require('express');
const authenticate  = require('../middleware/authenticate.middleware'); 
const { deleteUser, updateProfile, getUserDetails } = require('../controller/user.controller');

const router = express.Router();

router.delete('/', deleteUser);

router.patch('/:userId', updateProfile)

router.get('/:userId', getUserDetails);
module.exports = router;