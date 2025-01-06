const AsyncHandler = require("express-async-handler");
const transactionModel = require("../model/transaction.model");
const userModel = require("../model/user.model");

// Endpoint to store transactions in the database
// @route POST store trasnsactions
// @access Private
exports.storeTransactions = AsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { hash, from, to, value, blockNumber } = req.body;

  try {
    // Find the user by ID
    user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      hash,
      from,
      to,
      value,
      blockNumber,
    });

    // Save the transaction and add it to the user's transactions array
    await newTransaction.save();
    user.transactions.push(newTransaction._id);
    await user.save(); // Update the user with the new transaction

    res.status(201).json({
      message: "Transaction created and added to user",
      newTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});
