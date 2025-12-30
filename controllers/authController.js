const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');
const { generateOTP, getOTPExpiration } = require('../utils/otpGenerator');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

/**
 * @desc    Register new user and send OTP
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpire = getOTPExpiration();

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            otp,
            otpExpire,
            isVerified: false,
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name);
        } catch (error) {
            // Delete user if email fails
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({
                success: false,
                message: 'Error sending verification email. Please try again.',
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. OTP sent to your email.',
            data: {
                userId: user._id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup',
            error: error.message,
        });
    }
};

/**
 * @desc    Verify OTP and activate account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP',
            });
        }

        // Find user with OTP
        const user = await User.findOne({ email }).select('+otp +otpExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        // Check if OTP expired
        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                },
                token,
            },
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification',
            error: error.message,
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email first',
            });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message,
        });
    }
};

/**
 * @desc    Forgot password - Send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email',
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email',
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpire = getOTPExpiration();

        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();

        // Send password reset email
        try {
            await sendPasswordResetEmail(email, otp, user.name);
        } catch (error) {
            user.otp = undefined;
            user.otpExpire = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Error sending reset email. Please try again.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Reset password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, and new password',
            });
        }

        // Find user with OTP
        const user = await User.findOne({ email }).select('+otp +otpExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        // Check if OTP expired
        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Update password
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
            error: error.message,
        });
    }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email',
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified',
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpire = getOTPExpiration();

        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, user.name);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error sending OTP email. Please try again.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email',
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    signup,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
    resendOTP,
};
