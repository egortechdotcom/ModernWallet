const MoralisService = require("../services/MoralisService");
const { addWalletKey } = require("../utils/vault");

async function getTokens(req, res) {
  const { userAddress, chain } = req.query;

  try {
    const { tokens, nfts, balance } = await MoralisService.getUserData(
      userAddress,
      chain
    );

    return res.status(200).json({ tokens, nfts, balance });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getWalletTransaction(req, res) {
  const { userAddress, chain } = req.query;

  try {
    const transactions = await MoralisService.getWalletTransactions(
      userAddress,
      chain
    );

    return res.status(200).json({ data:transactions });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function setPrivateKey(req, res){
  const {secretName, secretValue} = req.body;

  try{ 
    const  addWallet = await addWalletKey(secretName, secretValue)
    console.log("response", addWallet);
    return res.status(200).json({data: "secreats created"})
  } catch(err){
    console.log("error :",err);
  }
}

module.exports = { getTokens, getWalletTransaction, setPrivateKey };
