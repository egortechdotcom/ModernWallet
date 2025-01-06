const express = require("express");
const router = express.Router();
const {
  getTokens,
  getWalletTransaction,
  setPrivateKey,
} = require("../controller/constroller");
const { getSecretVault, setSecretVault } = require("../services/vaultSerivce");
const {
  verifyRegister,
  sendOtpRegister,
  sendOtpLogin,
  verifyOtpLogin,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
} = require("../controller/authController");
const { addNetwork } = require("../controller/networkController");
const authenticate = require("../middleware/auth.middleware");
const { storeTransactions } = require("../controller/transactions.controller");

router.get("/getTokens", getTokens);
router.get("/getWalletTransaction", getWalletTransaction);
router.post("/addSecretKey", setPrivateKey);

// vault api's
router.post("/getSecret", getSecretVault);
router.post("/setSecret", setSecretVault);

// user manage api's

router.post("/login/sendOtp", sendOtpLogin);
router.post("/login/verifyOtp", verifyOtpLogin);
router.post("/register/sendOtp", sendOtpRegister);
router.post("/register/verifyOtp", verifyRegister);
router.post("/forgotPassword/sendOtp", forgotPasswordSendOtp);
router.post("/forgotPassword/verifyOtp", forgotPasswordVerifyOtp);
router.post("/network/add", authenticate, addNetwork);
router.post("/users/:userId/transactions", storeTransactions);

module.exports = router;
