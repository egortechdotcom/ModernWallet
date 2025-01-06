const AsyncHandler = require("express-async-handler");
const UserModel = require("../model/user.model");
const generateToken = require("../utils/generateToken");
const verifyToken = require("../utils/verifyToken");
const bcrypt = require("bcrypt");
const generateOTP = require("../utils/generateOtp");
const sendEmail = require("../services/emailService");
const UserVerificationModel = require("../model/userVerification.model");
const { json } = require("express");

// @send otp register
//@route POST SendOtpRegister
//@access Private
exports.sendOtpRegister = AsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Check if email exists
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ message: "User already exists with this email" });
  }

  const otp = generateOTP();

  const otpSent = await sendEmail(otp, email);
  if (!otpSent) {
    return res.status(500).json({ message: "Failed to send OTP" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(password, salt);

  // Register user with OTP
  await UserVerificationModel.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        password: passwordHashed,
        otp,
        otpVerified: false,
      },
    },
    { upsert: true }
  );
  
  res.json({ message: "OTP sent successfully" });
});

//@desc register User
//@route POST register
//@access Private
exports.verifyRegister = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  // Check if email exists
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const userVerification = await UserVerificationModel.findOne({ email });
  console.table(
    [
      userVerification.otp,
      typeof userVerification.otp,
      typeof otp,
      otp,
      userVerification.otp==otp
    ]
  )
  if (userVerification.otp === otp) {
    console.log(userVerification.otp, otp);
    // Delete user from UserVerificationModel
    await UserVerificationModel.deleteOne({ email });

    // Register user
    const user = await UserModel.create({
      name: userVerification.name,
      email: userVerification.email,
      password: userVerification.password,
    });
    return res.status(201).json({
      status: "success",
      data: user,
      message: "User has been registered",
    });
  }

  return (
    res.status(500).
    json({
      status: "verification failed",
      message: "something wrong with verification",
    })
  );
});


// Send Login  OTP API
exports.sendOtpLogin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(403).json({ message: "No User Found" });
  }

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    return res.status(403).json({ message: "Invalid Password" });
  }

  // Generate OTP
  const otp = generateOTP();

  // Update or create a UserVerificationModel entry with the new OTP
  await UserVerificationModel.findOneAndUpdate(
    { email: email },
    { $set: { otp: otp } },
    { upsert: true }
  );

  // Send the OTP to the user (you need to implement this part)
  sendEmail(otp, email);

  return res.status(200).json({ message: "OTP sent successfully" });
});

// Verify Login OTP API
exports.verifyOtpLogin = AsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find the user verification entry for the provided email
  const userVerification = await UserVerificationModel.findOne({ email });
  if (!userVerification) {
    return res.status(400).json({ message: "Email not found" });
  }
  // Check if the provided OTP matches the stored OTP
  if (userVerification.otp !== otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }
  const user = await UserModel.findOne({ email });
  return res.json({
    data: generateToken(user._id),
    message: "User logged in successfully",
  });
});

// Forgot password send otp api
exports.forgotPasswordSendOtp = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.json({ message: "user not found" });
  }

  // Generate OTP
  const otp = generateOTP();

  // Update or create a UserVerificationModel entry with the new OTP
  await UserVerificationModel.findOneAndUpdate(
    { email: email },
    { $set: { otp: otp } },
    { upsert: true }
  );

  // Send the OTP to the user (you need to implement this part)
  sendEmail(otp, email);

  return res.status(200).json({ message: "OTP sent successfully" });
});

// Forgot password verify otp api
exports.forgotPasswordVerifyOtp = AsyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  const userVerify = await UserVerificationModel.findOne({ email });
  if (!userVerify) {
    return res.status(403).json({ message: "user not found" });
  }
  if (otp !== userVerify.otp) {
    return res.status(403).json({ message: "Otp is Invalid" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(password, salt);

  await UserModel.findOneAndUpdate(
    { email: email },
    { $set: { password: passwordHashed } },
    { upsert: false }
  );

  return res.status(200).json({ message: "Password Changed Successfully" });
});
