const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define a schema for storing Ethereum transactions
const transactionSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true, // Transaction hash is mandatory
    unique: true, // Ensure it's unique
    trim: true, // Remove extra spaces if any
  },
  from: {
    type: String,
    required: true, // The sender's address is mandatory
  },
  to: {
    type: String,
    required: true, // The receiver's address is mandatory
  },
  value: {
    type: Number,
    required: true, // Transaction value is mandatory
    min: 0, // Ensure the value is not negative
  },
  blockNumber: {
    type: Number,
    required: true, // Block number is mandatory
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Create a model from the schema
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
