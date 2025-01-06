
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");


module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {

    sepolia: {
      url: `https://sepolia.infura.io/v3/infura_id`,
      accounts: ["Pvt_key"],
    },
  },
  etherscan: {
    apiKey: "Etherscan_Key",
  },
};