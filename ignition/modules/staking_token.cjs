const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule("StakingTokenModule", (m) => {
   const skt = m.contract("IToken", ['StakingToken', 'SKT']);
   return {skt};
});