const AsyncHandler = require("express-async-handler");
const UserModel = require("../model/user.model");

// @route POST /network/add
// @access Private
exports.addNetwork = AsyncHandler(async (req, res) => {
    const { networkName, networkURL, chainId, currencySymbol } = req.body;

    // Check for missing fields
    if (!networkName || !networkURL || typeof chainId !== "number" || !currencySymbol) {
        return res.status(400).json({ message: "All fields are required, chainId must be a number." });
    }

    try {
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check for duplicate network based on chainId
        const existingNetwork = user.networks.find(net => net.chainId === chainId);

        if (existingNetwork) {
            return res.status(400).json({ message: "Network with the same chainId already exists." });
        }

        // Add the new network to the user's list
        user.networks.push({ networkName, networkURL, chainId, currencySymbol });

        await user.save();

        res.status(201).json({ message: "Network added successfully", networks: user.networks });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
