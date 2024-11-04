const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("IStakingModule", (m) => {
    const args = [
        '0x074544eE9eb80C880B20E8a36244F371F0342620',
        '0xAC8bA1eE67520363DDD19cbd636F76623b5eA0d7',
        5 * 60 * 60 * 24, // 3 days
        10000,
    ];
    const istaking = m.contract("IStaking", args);
    return {istaking};
});