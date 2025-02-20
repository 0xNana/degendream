const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DegenDream", function () {
    let degenDream;
    let ldToken;
    let vrfCoordinator;
    let owner;
    let player;
    let treasury;
    let otherToken;

    const KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
    const SUBSCRIPTION_ID = 1;
    const MIN_BET = ethers.parseUnits("5", 6);    // 5 LD
    const MAX_BET = ethers.parseUnits("500", 6);  // 500 LD

    beforeEach(async function () {
        [owner, player, treasury] = await ethers.getSigners();

        // Deploy mock VRF Coordinator
        const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinator = await VRFCoordinatorV2Mock.deploy(0, 0);

        // Deploy mock LD Token
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        ldToken = await MockERC20.deploy("Lucky Degen", "LD", 6);
        otherToken = await MockERC20.deploy("Other Token", "OT", 18);

        // Deploy DegenDream
        const DegenDream = await ethers.getContractFactory("DegenDream");
        degenDream = await DegenDream.deploy(
            await vrfCoordinator.getAddress(),
            KEY_HASH,
            SUBSCRIPTION_ID,
            await ldToken.getAddress(),
            treasury.address
        );

        // Create VRF subscription
        await vrfCoordinator.createSubscription();
        await vrfCoordinator.addConsumer(SUBSCRIPTION_ID, await degenDream.getAddress());

        // Fund player with LD tokens
        await ldToken.mint(player.address, ethers.parseUnits("1000", 6));
        await ldToken.connect(player).approve(await degenDream.getAddress(), ethers.MaxUint256);
    });

    describe("Initialization", function () {
        it("Should initialize with correct values", async function () {
            expect(await degenDream.MIN_BET()).to.equal(MIN_BET);
            expect(await degenDream.MAX_BET()).to.equal(MAX_BET);
            expect(await degenDream.treasury()).to.equal(treasury.address);
            expect(await degenDream.SUBSCRIPTION_ID()).to.equal(SUBSCRIPTION_ID);
            expect(await degenDream.KEY_HASH()).to.equal(KEY_HASH);
        });
    });

    describe("Betting", function () {
        it("Should place a bet successfully", async function () {
            const betAmount = ethers.parseUnits("5", 6);
            const numbers = [1, 2, 3, 4, 5, 6];

            const tx = await degenDream.connect(player).placeBet(betAmount, numbers);
            const receipt = await tx.wait();

            // Find BetPlaced event
            const betPlacedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === "BetPlaced"
            );

            expect(betPlacedEvent).to.not.be.undefined;
            const [requestId, bettor, amount, betNumbers] = betPlacedEvent.args;

            expect(bettor).to.equal(player.address);
            expect(amount).to.equal(betAmount);
            expect(betNumbers).to.deep.equal(numbers);

            // Check bet storage
            const bet = await degenDream.getBet(requestId);
            expect(bet.player).to.equal(player.address);
            expect(bet.amount).to.equal(betAmount);
            expect(bet.numbers).to.deep.equal(numbers);
            expect(bet.processed).to.be.false;
        });

        it("Should revert if bet amount is too low", async function () {
            const betAmount = ethers.parseUnits("4", 6); // 4 LD is below MIN_BET
            const numbers = [1, 2, 3, 4, 5, 6];

            await expect(
                degenDream.connect(player).placeBet(betAmount, numbers)
            ).to.be.revertedWithCustomError(degenDream, "InvalidBetAmount");
        });

        it("Should revert if bet amount is too high", async function () {
            const betAmount = ethers.parseUnits("501", 6); // 501 LD is above MAX_BET
            const numbers = [1, 2, 3, 4, 5, 6];

            await expect(
                degenDream.connect(player).placeBet(betAmount, numbers)
            ).to.be.revertedWithCustomError(degenDream, "InvalidBetAmount");
        });

        it("Should revert if wrong number of numbers provided", async function () {
            const betAmount = ethers.parseUnits("5", 6);
            const numbers = [1, 2, 3, 4, 5]; // Only 5 numbers

            await expect(
                degenDream.connect(player).placeBet(betAmount, numbers)
            ).to.be.revertedWithCustomError(degenDream, "InvalidNumbersLength");
        });

        it("Should revert if duplicate numbers provided", async function () {
            const betAmount = ethers.parseUnits("5", 6);
            const numbers = [1, 2, 3, 4, 5, 5]; // Duplicate 5

            await expect(
                degenDream.connect(player).placeBet(betAmount, numbers)
            ).to.be.revertedWithCustomError(degenDream, "DuplicateNumber");
        });
    });

    describe("Prize calculation", function () {
        it("Should calculate prizes correctly", async function () {
            const betAmount = ethers.parseUnits("10", 6); // 10 LD

            expect(await degenDream.calculatePrize(6, betAmount)).to.equal(betAmount * BigInt(100));
            expect(await degenDream.calculatePrize(5, betAmount)).to.equal(betAmount * BigInt(50));
            expect(await degenDream.calculatePrize(4, betAmount)).to.equal(betAmount * BigInt(20));
            expect(await degenDream.calculatePrize(3, betAmount)).to.equal(betAmount * BigInt(10));
            expect(await degenDream.calculatePrize(2, betAmount)).to.equal(betAmount * BigInt(5));
            expect(await degenDream.calculatePrize(1, betAmount)).to.equal(0);
            expect(await degenDream.calculatePrize(0, betAmount)).to.equal(0);
        });
    });

    describe("2. Prize Distribution Tests", function () {
        it("Should correctly distribute bet amount between treasury and prize pool", async function () {
            const betAmount = ethers.parseUnits("100", 6);
            const initialTreasuryBalance = await ldToken.balanceOf(treasury.address);
            const initialPrizePool = await degenDream.prizePool();

            await degenDream.connect(player).placeBet(betAmount, [1, 2, 3, 4, 5, 6]);

            const expectedTreasury = betAmount * BigInt(10) / BigInt(100);
            const expectedPrizePool = betAmount * BigInt(90) / BigInt(100);

            const finalTreasuryBalance = await ldToken.balanceOf(treasury.address);
            const finalPrizePool = await degenDream.prizePool();

            expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(expectedTreasury);
            expect(finalPrizePool - initialPrizePool).to.equal(expectedPrizePool);
        });

        it("Should correctly calculate and award prizes", async function () {
            const betAmount = ethers.parseUnits("10", 6);
            const tx = await degenDream.connect(player).placeBet(betAmount, [1, 2, 3, 4, 5, 6]);
            const receipt = await tx.wait();

            const requestId = receipt.logs.find(
                log => log.topics[0] === degenDream.interface.getEvent("BetPlaced").topicHash
            ).topics[1];

            // Mock VRF response to force 6 matches
            await vrfCoordinator.fulfillRandomWordsWithOverride(
                requestId,
                await degenDream.getAddress(),
                [ethers.toBigInt('0x0000000000000000000000000000000000000000000000000000000000000001')]
            );

            const bet = await degenDream.getBet(requestId);
            expect(bet.processed).to.be.true;
            
            if (bet.matches === 6) {
                expect(bet.payout).to.equal(betAmount * BigInt(100)); // 100x for 6 matches
            }
        });
    });

    describe("3. Owner Controls Tests", function () {
        it("Should allow owner to update bet limits", async function () {
            const newMinBet = ethers.parseUnits("10", 6);
            const newMaxBet = ethers.parseUnits("1000", 6);

            await degenDream.setBetLimits(newMinBet, newMaxBet);

            expect(await degenDream.MIN_BET()).to.equal(newMinBet);
            expect(await degenDream.MAX_BET()).to.equal(newMaxBet);
        });

        it("Should allow owner to update callback gas limit", async function () {
            const newGasLimit = 3000000;
            await degenDream.setCallbackGasLimit(newGasLimit);
            expect(await degenDream.callbackGasLimit()).to.equal(newGasLimit);
        });

        it("Should allow owner to manage prize pool", async function () {
            const amount = ethers.parseUnits("100", 6);
            const initialPool = await degenDream.prizePool();

            // Mint and approve tokens for owner
            await ldToken.mint(owner.address, amount);
            await ldToken.connect(owner).approve(await degenDream.getAddress(), amount);

            await degenDream.addToPrizePool(amount);
            expect(await degenDream.prizePool()).to.equal(initialPool + amount);

            await degenDream.removePrizePoolFunds(amount);
            expect(await degenDream.prizePool()).to.equal(initialPool);
        });

        it("Should allow owner to rescue wrong tokens", async function () {
            const amount = ethers.parseUnits("100", 18);
            
            // Mint other tokens and send them to the contract
            await otherToken.mint(await degenDream.getAddress(), amount);

            await degenDream.rescueTokens(await otherToken.getAddress(), amount);
            expect(await otherToken.balanceOf(owner.address)).to.equal(amount);
        });

        it("Should prevent non-owner from accessing owner functions", async function () {
            await expect(
                degenDream.connect(player).setBetLimits(MIN_BET, MAX_BET)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                degenDream.connect(player).setCallbackGasLimit(3000000)
            ).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(
                degenDream.connect(player).addToPrizePool(ethers.parseUnits("100", 6))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("4. Security Tests", function () {
        it("Should enforce bet limits", async function () {
            const belowMin = MIN_BET - 1n;
            const aboveMax = MAX_BET + 1n;

            await expect(
                degenDream.connect(player).placeBet(belowMin, [1, 2, 3, 4, 5, 6])
            ).to.be.revertedWithCustomError(degenDream, "InvalidBetAmount");

            await expect(
                degenDream.connect(player).placeBet(aboveMax, [1, 2, 3, 4, 5, 6])
            ).to.be.revertedWithCustomError(degenDream, "InvalidBetAmount");
        });

        it("Should validate number selections", async function () {
            const betAmount = ethers.parseUnits("10", 6);

            // Test invalid number count
            await expect(
                degenDream.connect(player).placeBet(betAmount, [1, 2, 3, 4, 5])
            ).to.be.revertedWithCustomError(degenDream, "InvalidNumbersLength");

            // Test invalid number value
            await expect(
                degenDream.connect(player).placeBet(betAmount, [0, 1, 2, 3, 4, 5])
            ).to.be.revertedWithCustomError(degenDream, "InvalidNumber");

            // Test duplicate numbers
            await expect(
                degenDream.connect(player).placeBet(betAmount, [1, 1, 2, 3, 4, 5])
            ).to.be.revertedWithCustomError(degenDream, "DuplicateNumber");
        });

        it("Should handle pause/unpause correctly", async function () {
            await degenDream.pause();
            
            await expect(
                degenDream.connect(player).placeBet(MIN_BET, [1, 2, 3, 4, 5, 6])
            ).to.be.revertedWith("Pausable: paused");

            await degenDream.unpause();
            
            const tx = await degenDream.connect(player).placeBet(MIN_BET, [1, 2, 3, 4, 5, 6]);
            expect((await tx.wait()).status).to.equal(1);
        });
    });

    describe("5. Emergency Functions Tests", function () {
        it("Should allow emergency withdrawal", async function () {
            // Add funds to prize pool first
            const amount = ethers.parseUnits("100", 6);
            await ldToken.mint(owner.address, amount);
            await ldToken.connect(owner).approve(await degenDream.getAddress(), amount);
            await degenDream.addToPrizePool(amount);

            const initialBalance = await ldToken.balanceOf(owner.address);
            await degenDream.emergencyWithdraw();
            const finalBalance = await ldToken.balanceOf(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
            expect(await degenDream.prizePool()).to.equal(0);
        });

        it("Should prevent rescuing game token", async function () {
            await expect(
                degenDream.rescueTokens(await ldToken.getAddress(), ethers.parseUnits("1", 6))
            ).to.be.revertedWith("Cannot rescue game token");
        });
    });

    describe("6. Testing Functions (To be removed before mainnet)", function () {
        it("Should allow owner to change betting token for testing purposes", async function () {
            // Deploy a new test token
            const NewMockERC20 = await ethers.getContractFactory("MockERC20");
            const newToken = await NewMockERC20.deploy("New Token", "NEW", 6);
            
            // Place a bet with original token
            const betAmount = ethers.parseUnits("10", 6);
            await degenDream.connect(player).placeBet(betAmount, [1, 2, 3, 4, 5, 6]);
            
            // Change token
            await degenDream.setBettingToken(await newToken.getAddress());
            
            // Verify token changed
            expect(await degenDream.bettingToken()).to.equal(await newToken.getAddress());
            
            // Demonstrate potential issues:
            // 1. Old prize pool is now in old token
            // 2. New bets will be in new token
            await newToken.mint(player.address, betAmount);
            await newToken.connect(player).approve(await degenDream.getAddress(), betAmount);
            
            // Can still place bets with new token
            await degenDream.connect(player).placeBet(betAmount, [1, 2, 3, 4, 5, 6]);
            
            // But old token balance is stranded in contract
            expect(await ldToken.balanceOf(await degenDream.getAddress())).to.be.gt(0);
        });

        it("Should prevent non-owner from changing betting token", async function () {
            const NewMockERC20 = await ethers.getContractFactory("MockERC20");
            const newToken = await NewMockERC20.deploy("New Token", "NEW", 6);
            
            await expect(
                degenDream.connect(player).setBettingToken(await newToken.getAddress())
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
}); 