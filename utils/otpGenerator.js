/**
 * Generates a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    // Generate a random number between 100000 and 999999
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
};

/**
 * Get OTP expiration time
 * @param {number} minutes - Minutes until expiration (default from env)
 * @returns {Date} Expiration date
 */
const getOTPExpiration = (minutes = process.env.OTP_EXPIRE_MINUTES || 10) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = {
    generateOTP,
    getOTPExpiration,
};
