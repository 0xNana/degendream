// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DegenDreamToken is ERC20, Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 billion tokens
    uint256 public constant DEFAULT_FAUCET_AMOUNT = 1_000 * 10**18; // 1,000 tokens
    uint256 public constant DEFAULT_FAUCET_INTERVAL = 12 hours;

    // State variables
    uint256 public faucetAmount;
    uint256 public faucetInterval;
    mapping(address => uint256) public lastFaucetRequest;

    // Events
    event FaucetRequested(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetParametersUpdated(uint256 newAmount, uint256 newInterval);

    constructor() ERC20("Degen Dream", "DD") {
        faucetAmount = DEFAULT_FAUCET_AMOUNT;
        faucetInterval = DEFAULT_FAUCET_INTERVAL;
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @notice Request tokens from the faucet
     */
    function requestTokens() external nonReentrant {
        require(
            block.timestamp >= lastFaucetRequest[msg.sender] + faucetInterval,
            "Wait for cooldown period"
        );
        require(
            balanceOf(address(this)) >= faucetAmount,
            "Insufficient faucet balance"
        );

        lastFaucetRequest[msg.sender] = block.timestamp;
        _transfer(address(this), msg.sender, faucetAmount);

        emit FaucetRequested(msg.sender, faucetAmount, block.timestamp);
    }

    /**
     * @notice Update faucet parameters
     * @param newAmount New amount of tokens per request
     * @param newInterval New interval between requests
     */
    function updateFaucetParameters(
        uint256 newAmount,
        uint256 newInterval
    ) external onlyOwner {
        require(newAmount > 0, "Amount must be positive");
        require(newInterval > 0, "Interval must be positive");
        
        faucetAmount = newAmount;
        faucetInterval = newInterval;

        emit FaucetParametersUpdated(newAmount, newInterval);
    }

    /**
     * @notice Fund the faucet with tokens
     * @param amount Amount of tokens to add to faucet (negative to withdraw)
     */
    function fundFaucet(int256 amount) external {
        require(amount != 0, "Amount cannot be zero");
        if (amount > 0) {
            _transfer(msg.sender, address(this), uint256(amount));
        } else {
            _transfer(address(this), msg.sender, uint256(-amount));
        }
    }

    /**
     * @notice Get time remaining until next faucet request
     * @param user Address to check
     * @return Time remaining in seconds, 0 if can request now
     */
    function getTimeUntilNextRequest(address user) external view returns (uint256) {
        uint256 lastRequest = lastFaucetRequest[user];
        uint256 nextValidRequest = lastRequest + faucetInterval;
        
        if (block.timestamp >= nextValidRequest) {
            return 0;
        }
        
        return nextValidRequest - block.timestamp;
    }
} 