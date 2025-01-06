const mongoose = require("mongoose");
const { Schema } = mongoose;

const userVerificationSchema = new Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    otp:{
      type:Number,
      required:true,
      default: null
    },
    otpVerified:{
      type: Boolean,
      required:true,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const UserVerificationModel = mongoose.model("UserVerification", userVerificationSchema);

module.exports =  UserVerificationModel 
