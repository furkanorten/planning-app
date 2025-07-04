const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

const { registerUser, loginUser } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logoutUser);

module.exports = router;