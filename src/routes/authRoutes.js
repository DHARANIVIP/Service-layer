const express = require('express');
const {
    signup,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
    resendOTP,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

// Protected route example (you can add more protected routes here)
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
});

module.exports = router;
