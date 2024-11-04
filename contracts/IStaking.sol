// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IStaking is Ownable, ERC721 {
    struct Stake {
        uint amount;
        uint earnedRewards;
        uint startTime;
        uint lastStakeTime;
        uint mintableStartTime;
        bool isMinted;
    }

    mapping(address => uint) public user2IST; // 用户地址持有的ERC721
    mapping(uint => address) public IST2User; // ERC721对应的用户地址
    mapping(address => Stake) public stakes; // 用户的质押记录
    uint private _tokenIdCounter;

    IERC20 public stakingToken;
    IERC20 public rewardToken;

    uint256 public totalStaked;
    uint256 public totalRewards;
    uint256 public extraRewards;
    uint256 public totalRewardDistributed;
    uint256 public stakingDuration;
    uint256 public stakingStartTime;
    uint256 public totalMintedCount;
    uint256 public mintDurationAfterEnded;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);
    event TokenMinted(address indexed user, uint256 tokenId);

    constructor(address _stakingToken, address _rewardToken, uint256 _mintDurationAfterEnded, uint256 _initialTokenId)
    ERC721("IStakingToken", "IST") Ownable(msg.sender)
    {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        mintDurationAfterEnded = _mintDurationAfterEnded;
        _tokenIdCounter = _initialTokenId;
    }

    modifier duringStakingPeriod() {
        require(stakingStartTime > 0 && block.timestamp < stakingStartTime + stakingDuration, "Not in staking period");
        _;
    }

    modifier stakingPeriodEnded() {
        require(stakingStartTime > 0 && block.timestamp >= stakingStartTime + stakingDuration, "Staking is running");
        _;
    }

    function start(uint256 _totalRewards, uint256 _extraRewardsRatios, uint256 _stakingDuration) external onlyOwner {
        totalRewards = _totalRewards * (100 - _extraRewardsRatios) / 100;
        extraRewards = _totalRewards - totalRewards;
        stakingStartTime = block.timestamp;
        stakingDuration = _stakingDuration;
    }

    function stake(uint256 amount) external duringStakingPeriod {
        require(amount >= 50, "Must stake >= 50");
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        Stake storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.lastStakeTime > 0) {
            uint previousRewards = _calculateReward(msg.sender);
            stakeInfo.earnedRewards += previousRewards;
        } else {
            stakeInfo.startTime = block.timestamp;
        }

        stakeInfo.amount += amount;
        if (stakeInfo.amount >= 3000 && stakeInfo.mintableStartTime == 0) {
            stakeInfo.mintableStartTime = block.timestamp;
        }
        stakeInfo.lastStakeTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        Stake storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount >= amount, "Insufficient stake");

        uint256 reward = _calculateReward(msg.sender);
        stakeInfo.earnedRewards += reward;

        require(totalRewardDistributed + stakeInfo.earnedRewards <= totalRewards, "Exceeds total rewards");
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        require(rewardToken.transfer(msg.sender, stakeInfo.earnedRewards), "Reward transfer failed");

        stakeInfo.amount -= amount;
        totalStaked -= amount;

        totalRewardDistributed += stakeInfo.earnedRewards;
        stakeInfo.earnedRewards = 0;

        emit Withdrawn(msg.sender, amount, reward);
    }

    function getExtraRewards() public view stakingPeriodEnded returns (uint) {
        if (user2IST[msg.sender] == 0) {
            return 0;
        }
        return extraRewards / totalMintedCount * 1e10;
    }

    function withdrawExtraRewards() external stakingPeriodEnded returns (uint) {
        uint rewards = getExtraRewards();
        require(rewards > 0, "Insufficient extra rewards");
        require(block.timestamp > stakingStartTime + stakingDuration + mintDurationAfterEnded, "is not ready");
        require(rewardToken.transfer(msg.sender, rewards), "Extra Rewards transfer failed");
        return rewards;
    }

    function extraRewardsWithdrawCountdownTime() external view returns (uint) {
        uint t = stakingStartTime + stakingDuration + mintDurationAfterEnded;
        return block.timestamp > t ? 0 : t - block.timestamp;
    }

    function getStakeInfo() external view returns (uint256 amount, uint256 rewards, uint stakeTime) {
        Stake storage stakeInfo = stakes[msg.sender];
        uint256 pendingRewards = _calculateReward(msg.sender); // 计算未提取的收益
        amount = stakeInfo.amount; // 用户质押数量
        rewards = stakeInfo.earnedRewards + pendingRewards; // 包括已赚取和未提取的收益
        stakeTime = _min(block.timestamp, stakingStartTime + stakingDuration) - stakeInfo.startTime;
    }

    function _calculateReward(address user) private view returns (uint256) {
        Stake storage stakeInfo = stakes[user];
        if (stakeInfo.amount == 0 || stakingStartTime == 0) return 0;

        uint256 elapsedTime = _min(block.timestamp, stakingStartTime + stakingDuration) - stakeInfo.lastStakeTime;
        uint256 userShare = (stakeInfo.amount * 1e18) / totalStaked;
        uint256 reward = (userShare * totalRewards * elapsedTime) / (1e18 * stakingDuration);

        if (totalRewardDistributed + reward > totalRewards) {
            reward = totalRewards - totalRewardDistributed;
        }

        return reward;
    }

    function canMint() public view returns (bool) {
        Stake memory stakeInfo = stakes[msg.sender];
        uint t = stakingStartTime + stakingDuration + mintDurationAfterEnded;
        if (block.timestamp > t) return false;
        return !stakeInfo.isMinted && stakeInfo.mintableStartTime > 0 && _min(block.timestamp, stakingStartTime + stakingDuration) - stakeInfo.mintableStartTime >= stakingDuration * 60 / 100;
    }

    function mintToken() external returns(uint) {
        require(canMint(), "Cannot mint");

        Stake storage stakeInfo = stakes[msg.sender];

        uint tokenId = _tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _tokenIdCounter += 1;

        stakeInfo.isMinted = true;
        user2IST[msg.sender] = tokenId;
        IST2User[tokenId] = msg.sender;

        totalMintedCount += 1;

        emit TokenMinted(msg.sender, tokenId);

        return tokenId;
    }

    function _min(uint x, uint y) private pure returns(uint) {
        return x >= y ? y : x;
    }
}