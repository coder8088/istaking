require("@nomicfoundation/hardhat-ignition");

module.exports = {
    solidity: "0.8.27",
    networks: {
        sepolia: {
            url: 'https://eth-sepolia.g.alchemy.com/v2/LrSyswWbYbU6U4wpltmK7ZzsWE3IGdnR',
            accounts: ['595e24e5e5e131d961eb8373967cdda8ba2ea817cfe749317c6d57bf41c7aac5']
        }
    }
};