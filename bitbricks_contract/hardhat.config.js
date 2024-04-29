require("@matterlabs/hardhat-zksync-solc");


const PRIVATE_KEY = "f787bdb3c698fe7d55ba47c834752f7f63ab6eb1b20311474ec01d9ffa86de9f"
const RPC_URL = "https://80002.rpc.thirdweb.com"
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "polygonAmoy",
  networks: {
    hardhat:{
      chainId: 80002,
    },
    polygonAmoy:{
      url: RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
