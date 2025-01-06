const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const NetworkSchema = new mongoose.Schema({
  networkName: {
    type: String,
    required: true,
  },
  networkURL: {
    type: String,
    required: true,
  },
  chainId: {
    type: Number,
    required: true,
  },
  currencySymbol: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    networks: [NetworkSchema], // User's list of networks
    transactions: [{
      type: Types.ObjectId,
      ref: "Transaction", // References the Transaction model
    }],
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
