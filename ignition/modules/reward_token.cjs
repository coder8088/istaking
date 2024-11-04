const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("RewardTokenModule", (m) => {
    const rwt = m.contract("IToken", ['RewardToken', 'RWT']);
    return {rwt};
});