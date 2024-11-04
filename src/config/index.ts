import {getDefaultConfig} from "@rainbow-me/rainbowkit";
import {sepolia} from "viem/chains";
import {http} from "viem";

export const config = getDefaultConfig({
    projectId: "0e678f5c282e1af4f98842ea5e75bd53",
    appName: "iStaking",
    chains: [sepolia],
    transports: {
        [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/LrSyswWbYbU6U4wpltmK7ZzsWE3IGdnR'),
    },
});

export const addresses = {
    owner: "0x847AD7C060AAf1f42fBC6dfe01507593D93e6976".toLowerCase(),
    contractAddress: "0x37Fd20abD4149720571E3ddDC861B7d7f85788e2".toLowerCase(),
    sktTokenAddress: "0x074544eE9eb80C880B20E8a36244F371F0342620".toLowerCase(),
    rwtTokenAddress: "0xAC8bA1eE67520363DDD19cbd636F76623b5eA0d7".toLowerCase(),
}