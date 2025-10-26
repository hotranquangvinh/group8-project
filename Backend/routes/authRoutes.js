const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController');
const { debugResetPassword } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
// DEBUG route - remove in production
router.post('/debug/reset-password', debugResetPassword);

module.exports = router;