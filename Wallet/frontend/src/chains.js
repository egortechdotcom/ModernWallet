export let CHAINS_CONFIG = {
  "0x1": {
    hex: "0x1",
    name: "Ethereum",
    rpcUrl: process.env.REACT_APP_ETHEREUM_RPC_URL,
    ticker: "ETH Mainnet",
    txnURL: "https://sepolia.etherscan.io/tx/",
  },
  "0x13881": {
    hex: "0x13881",
    name: "Mumbai",
    rpcUrl: process.env.REACT_APP_MUMBAI_RPC_URL,
    ticker: "MATIC",
    txnURL: "https://sepolia.etherscan.io/tx/",
  },
  "0xaa36a7": {
    hex: "0xaa36a7",
    name: "Sepolia",
    rpcUrl: process.env.REACT_APP_SEPOLIA_RPC_URL,
    ticker: "Sepolia",
    txnURL: "https://sepolia.etherscan.io/tx/",
  },
};
