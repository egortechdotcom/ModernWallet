const crypto = require("crypto");
const generateOTP = () => {
    const OTP = crypto.randomInt(999,9999);
    return OTP;
  };
  
  module.exports = generateOTP;
  