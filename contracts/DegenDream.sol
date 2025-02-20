// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
// Update VRF imports for v2.5
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract DegenDream is VRFConsumerBaseV2Plus, Pausable, ReentrancyGuard {
    // Custom errors
    error InvalidBetAmount(uint256 amount, uint256 minBet, uint256 maxBet);
    error InvalidNumbersLength();
    error InvalidNumber(uint8 number);
    error DuplicateNumber(uint8 number);
    error TransferFailed();
    error InsufficientBalance(uint256 required, uint256 actual);

    // Constants
    uint256 public MIN_BET = 5 * 10**18;    // 5 tokens (made non-constant for owner control)
    uint256 public MAX_BET = 500 * 10**18;  // 500 tokens (made non-constant for owner control)
    uint8 public constant REQUIRED_NUMBERS = 6;
    uint8 public constant MAX_NUMBER = 99;
    uint8 public constant PRIZE_POOL_PERCENT = 90;  // 90% to prize pool
    uint8 public constant TREASURY_PERCENT = 10;    // 10% to treasury

    // VRF Configuration
    bytes32 public immutable KEY_HASH;
    uint256 public immutable SUBSCRIPTION_ID; // Updated to uint256 for v2.5
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public callbackGasLimit = 2500000;  // Made non-constant for owner control
    uint32 public constant NUM_WORDS = 1;

    // Token and Treasury
    IERC20 public bettingToken;
    address public treasury;
    uint256 public prizePool;

    // Bet struct
    struct Bet {
        address player;
        uint256 amount;
        uint8[] numbers;
        bool processed;
        uint8 matches;
        uint256 payout;
    }

    // Storage
    mapping(uint256 => Bet) public bets;  // requestId => Bet

    // Events
    event BetPlaced(uint256 indexed requestId, address indexed player, uint256 amount, uint8[] numbers);
    event NumbersDrawn(uint256 indexed requestId, uint8[] numbers);
    event PrizeAwarded(uint256 indexed requestId, address indexed player, uint256 amount, uint8 matches);
    event PrizePoolUpdated(uint256 newAmount);
    event CallbackGasLimitUpdated(uint32 newLimit);
    event BetLimitsUpdated(uint256 minBet, uint256 maxBet);
    event EmergencyWithdrawal(uint256 amount);
    event TokensRescued(address token, uint256 amount);
    event BettingTokenChanged(address indexed oldToken, address indexed newToken);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        address _bettingToken,
        address _treasury
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        if (_bettingToken == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();

        KEY_HASH = _keyHash;
        SUBSCRIPTION_ID = _subscriptionId;
        bettingToken = IERC20(_bettingToken);
        treasury = _treasury;
    }

    function placeBet(uint256 amount, uint8[] calldata numbers) external nonReentrant whenNotPaused returns (uint256) {
        // Validate bet amount
        if (amount < MIN_BET || amount > MAX_BET) {
            revert InvalidBetAmount(amount, MIN_BET, MAX_BET);
        }

        // Validate numbers
        if (numbers.length != REQUIRED_NUMBERS) {
            revert InvalidNumbersLength();
        }

        // Check for valid and unique numbers using bit operations
        uint256 usedNumbers;
        for (uint256 i = 0; i < numbers.length; i++) {
            uint8 number = numbers[i];
            if (number == 0 || number > MAX_NUMBER) {
                revert InvalidNumber(number);
            }
            uint256 bit = 1 << number;
            if (usedNumbers & bit != 0) {
                revert DuplicateNumber(number);
            }
            usedNumbers |= bit;
        }

        // Transfer tokens from player
        bool success = bettingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        // Split amount between prize pool and treasury
        uint256 toPrizePool = (amount * PRIZE_POOL_PERCENT) / 100;
        uint256 toTreasury = amount - toPrizePool;

        // Update prize pool and transfer treasury share
        prizePool += toPrizePool;
        success = bettingToken.transfer(treasury, toTreasury);
        if (!success) revert TransferFailed();

        // Request random number using VRF v2.5
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        // Store bet details
        bets[requestId] = Bet({
            player: msg.sender,
            amount: amount,
            numbers: numbers,
            processed: false,
            matches: 0,
            payout: 0
        });

        emit BetPlaced(requestId, msg.sender, amount, numbers);
        emit PrizePoolUpdated(prizePool);

        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        Bet storage bet = bets[requestId];
        if (!bet.processed) {
            // Generate winning numbers
            uint8[] memory winningNumbers = new uint8[](REQUIRED_NUMBERS);
            uint256 usedBits;
            uint256 numbersGenerated;
            uint256 rand = randomWords[0];

            // Generate unique winning numbers
            while (numbersGenerated < REQUIRED_NUMBERS) {
                rand = uint256(keccak256(abi.encode(rand)));
                uint8 num = uint8((rand % MAX_NUMBER) + 1);
                uint256 bit = 1 << num;
                if (usedBits & bit == 0) {
                    usedBits |= bit;
                    winningNumbers[numbersGenerated] = num;
                    numbersGenerated++;
                }
            }

            // Count matches
            uint8 matches;
            for (uint256 i = 0; i < bet.numbers.length; i++) {
                for (uint256 j = 0; j < REQUIRED_NUMBERS; j++) {
                    if (bet.numbers[i] == winningNumbers[j]) {
                        matches++;
                        break;
                    }
                }
            }

            // Calculate and award prize
            uint256 prize = calculatePrize(matches, bet.amount);
            if (prize > 0 && prize <= prizePool) {
                prizePool -= prize;
                bool success = bettingToken.transfer(bet.player, prize);
                if (!success) revert TransferFailed();
            }

            // Update bet status
            bet.processed = true;
            bet.matches = matches;
            bet.payout = prize;

            // Emit events
            emit NumbersDrawn(requestId, winningNumbers);
            emit PrizeAwarded(requestId, bet.player, prize, matches);
            emit PrizePoolUpdated(prizePool);
        }
    }

    function calculatePrize(uint8 matches, uint256 betAmount) public pure returns (uint256) {
        // Prize multipliers
        if (matches == 6) return betAmount * 100;  // 100x for 6 matches
        if (matches == 5) return betAmount * 50;   // 50x for 5 matches
        if (matches == 4) return betAmount * 20;   // 20x for 4 matches
        if (matches == 3) return betAmount * 10;   // 10x for 3 matches
        if (matches == 2) return betAmount * 5;    // 5x for 2 matches
        return 0;  // No prize for 0-1 matches
    }

    // Admin functions
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency withdrawal
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = bettingToken.balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        bool success = bettingToken.transfer(owner(), balance);
        if (!success) revert TransferFailed();
        prizePool = 0; // Reset prize pool after emergency withdrawal
        emit PrizePoolUpdated(0);
        emit EmergencyWithdrawal(balance);
    }

    // Prize pool management
    function addToPrizePool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        bool success = bettingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        prizePool += amount;
        emit PrizePoolUpdated(prizePool);
    }

    function removePrizePoolFunds(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= prizePool, "Amount exceeds prize pool");
        bool success = bettingToken.transfer(owner(), amount);
        if (!success) revert TransferFailed();
        prizePool -= amount;
        emit PrizePoolUpdated(prizePool);
    }

    // VRF settings
    function setCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        require(_callbackGasLimit >= 100000, "Gas limit too low");
        require(_callbackGasLimit <= 5000000, "Gas limit too high");
        callbackGasLimit = _callbackGasLimit;
        emit CallbackGasLimitUpdated(callbackGasLimit);
    }

    // Rescue tokens
    function rescueTokens(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(bettingToken), "Cannot rescue game token");
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        bool success = token.transfer(owner(), amount);
        require(success, "Token rescue failed");
        emit TokensRescued(tokenAddress, amount);
    }

    // Update bet limits
    function setBetLimits(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet > 0, "Min bet must be greater than 0");
        require(_maxBet > _minBet, "Max bet must be greater than min bet");
        require(_maxBet <= 1000000 * 10**18, "Max bet too high"); // Cap at 1M tokens
        MIN_BET = _minBet;
        MAX_BET = _maxBet;
        emit BetLimitsUpdated(MIN_BET, MAX_BET);
    }

    // Function to change betting token (only for testing, remove in mainnet)
    function setBettingToken(address _newToken) external onlyOwner {
        if (_newToken == address(0)) revert ZeroAddress();
        address oldToken = address(bettingToken);
        bettingToken = IERC20(_newToken);
        emit BettingTokenChanged(oldToken, _newToken);
    }

    // View functions
    function getBet(uint256 requestId) external view returns (
        address player,
        uint256 amount,
        uint8[] memory numbers,
        bool processed,
        uint8 matches,
        uint256 payout
    ) {
        Bet storage bet = bets[requestId];
        return (
            bet.player,
            bet.amount,
            bet.numbers,
            bet.processed,
            bet.matches,
            bet.payout
        );
    }
} 