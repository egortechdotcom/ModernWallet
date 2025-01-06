const Moralis = require("moralis").default;
require("dotenv").config();

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
});
async function getUserData(userAddress, chain) {
  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain,
    address: userAddress,
  });

  const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
    chain,
    address: userAddress,
    mediaItems: true,
  });

  // Process nftImages...

  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    chain,
    address: userAddress,
  });

  return { tokens: tokens.raw, nfts: [], balance: balance.raw.balance / 10 ** 18 };
}

async function getWalletTransactions(userAddress, chain) {
  const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    chain,
    address: userAddress,
  });

  return response.raw;
}

module.exports = { getUserData, getWalletTransactions };
