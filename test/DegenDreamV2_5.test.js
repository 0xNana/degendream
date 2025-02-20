const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DegenDream with VRF V2.5", function () {
    let degenDream;
    let ddToken;
    let vrfCoordinator;
    let owner;
    let player;
    let treasury;

    const KEY_HASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
    const SUBSCRIPTION_ID = 1;
    const MIN_BET = ethers.parseEther("5");    // 5 DD
    const MAX_BET = ethers.parseEther("500");  // 500 DD

    beforeEach(async function () {
        [owner, player, treasury] = await ethers.getSigners();

        // Deploy mock VRF Coordinator V2.5
        const VRFCoordinatorV2_5Mock = await ethers.getContractFactory("VRFCoordinatorV2_5Mock");
        vrfCoordinator = await VRFCoordinatorV2_5Mock.deploy();

        // Deploy DD Token
        const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
        ddToken = await DegenDreamToken.deploy();

        // Deploy DegenDream
        const DegenDream = await ethers.getContractFactory("DegenDream");
        degenDream = await DegenDream.deploy(
            await vrfCoordinator.getAddress(),
            KEY_HASH,
            SUBSCRIPTION_ID,
            await ddToken.getAddress(),
            treasury.address
        );

        // Fund player with DD tokens
        await ddToken.transfer(player.address, ethers.parseEther("1000"));
        await ddToken.connect(player).approve(await degenDream.getAddress(), ethers.MaxUint256);
    });

    describe("Basic Functionality", function () {
        it("Should initialize with correct values", async function () {
            expect(await degenDream.MIN_BET()).to.equal(MIN_BET);
            expect(await degenDream.MAX_BET()).to.equal(MAX_BET);
            expect(await degenDream.treasury()).to.equal(treasury.address);
            expect(await degenDream.SUBSCRIPTION_ID()).to.equal(SUBSCRIPTION_ID);
            expect(await degenDream.KEY_HASH()).to.equal(KEY_HASH);
        });

        it("Should handle bet amount limits correctly", async function () {
            const numbers = [1, 2, 3, 4, 5, 6];
            
            // Test minimum bet
            await expect(
                degenDream.connect(player).placeBet(MIN_BET - 1n, numbers)
            ).to.be.revertedWithCustomError(degenDream, "InvalidBetAmount");

            // Test maximum bet
            await expect(
                degenDream.connect(player).placeBet(MAX_BET + 1n, numbers)
            ).to.be.revertedWithCustomError(degenDream, "InvalidBetAmount");

            // Test valid bet
            const validBet = await degenDream.connect(player).placeBet(MIN_BET, numbers);
            const receipt = await validBet.wait();
            expect(receipt.logs.some(log => log.fragment?.name === "BetPlaced")).to.be.true;
        });

        it("Should split bet amount correctly between prize pool and treasury", async function () {
            const betAmount = ethers.parseEther("100");
            const numbers = [1, 2, 3, 4, 5, 6];

            const initialTreasuryBalance = await ddToken.balanceOf(treasury.address);
            const initialPrizePool = await degenDream.prizePool();

            await degenDream.connect(player).placeBet(betAmount, numbers);

            const expectedTreasury = betAmount * BigInt(10) / BigInt(100);
            const expectedPrizePool = betAmount * BigInt(90) / BigInt(100);

            const finalTreasuryBalance = await ddToken.balanceOf(treasury.address);
            const finalPrizePool = await degenDream.prizePool();

            expect(finalTreasuryBalance - initialTreasuryBalance).to.equal(expectedTreasury);
            expect(finalPrizePool - initialPrizePool).to.equal(expectedPrizePool);
        });
    });

    describe("VRF Integration", function () {
        async function placeBetAndGetRequestId() {
            const betAmount = ethers.parseEther("5");
            const numbers = [1, 2, 3, 4, 5, 6];
            
            const tx = await degenDream.connect(player).placeBet(betAmount, numbers);
            const receipt = await tx.wait();
            
            // Get requestId from transaction events
            const requestId = receipt.logs[0].topics[1];
            return requestId;
        }

        it("Should generate valid winning numbers", async function () {
            const requestId = await placeBetAndGetRequestId();
            
            // Generate and fulfill random words
            const randomWords = await vrfCoordinator.generateRandomWords(requestId, 1);
            await vrfCoordinator.fulfillRandomWordsWithOverride(
                requestId,
                await degenDream.getAddress(),
                randomWords
            );

            // Get the bet result
            const bet = await degenDream.getBet(requestId);
            expect(bet.processed).to.be.true;

            // Verify winning numbers
            const numbers = bet.numbers;
            expect(numbers.length).to.equal(6);

            // Check uniqueness
            const uniqueNumbers = new Set();
            for (const num of numbers) {
                uniqueNumbers.add(num.toString());
            }
            expect(uniqueNumbers.size).to.equal(6);

            // Check number range
            for (const num of numbers) {
                expect(Number(num)).to.be.above(0);
                expect(Number(num)).to.be.below(100);
            }
        });

        it("Should prevent double fulfillment", async function () {
            const requestId = await placeBetAndGetRequestId();
            
            const randomWords = await vrfCoordinator.generateRandomWords(requestId, 1);
            
            // First fulfillment should succeed
            await vrfCoordinator.fulfillRandomWordsWithOverride(
                requestId,
                await degenDream.getAddress(),
                randomWords
            );

            // Second fulfillment should fail
            await expect(
                vrfCoordinator.fulfillRandomWordsWithOverride(
                    requestId,
                    await degenDream.getAddress(),
                    randomWords
                )
            ).to.be.revertedWith("Request already fulfilled");
        });

        it("Should calculate prizes correctly", async function () {
            const betAmount = ethers.parseEther("10");
            const numbers = [1, 2, 3, 4, 5, 6];

            // Place bet
            const tx = await degenDream.connect(player).placeBet(betAmount, numbers);
            const receipt = await tx.wait();
            const requestId = receipt.logs[0].topics[1];

            // Record initial balances
            const initialPlayerBalance = await ddToken.balanceOf(player.address);
            const initialPrizePool = await degenDream.prizePool();

            // Fulfill VRF request
            const randomWords = await vrfCoordinator.generateRandomWords(requestId, 1);
            await vrfCoordinator.fulfillRandomWordsWithOverride(
                requestId,
                await degenDream.getAddress(),
                randomWords
            );

            // Check results
            const bet = await degenDream.getBet(requestId);
            
            if (bet.matches > 1) {
                const expectedPrize = await degenDream.calculatePrize(bet.matches, betAmount);
                expect(bet.payout).to.equal(expectedPrize);

                const finalPlayerBalance = await ddToken.balanceOf(player.address);
                const finalPrizePool = await degenDream.prizePool();

                expect(finalPlayerBalance - initialPlayerBalance).to.equal(expectedPrize);
                expect(initialPrizePool - finalPrizePool).to.equal(expectedPrize);
            }
        });
    });
}); 