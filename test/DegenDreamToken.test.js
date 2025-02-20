const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DegenDreamToken", function () {
    let token;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
        token = await DegenDreamToken.deploy();
        await token.waitForDeployment();

        // Fund the faucet with 1 million tokens
        const faucetAmount = ethers.parseEther("1000000");
        await token.connect(owner).transfer(await token.getAddress(), faucetAmount);
    });

    describe("Initialization", function () {
        it("Should initialize with correct values", async function () {
            expect(await token.name()).to.equal("Degen Dream");
            expect(await token.symbol()).to.equal("DD");
            expect(await token.totalSupply()).to.equal(ethers.parseEther("10000000000")); // 10 billion
            expect(await token.faucetAmount()).to.equal(ethers.parseEther("1000")); // 1,000 tokens
            expect(await token.faucetInterval()).to.equal(12 * 3600); // 12 hours
        });
    });

    describe("Faucet Functionality", function () {
        it("Should allow users to request tokens", async function () {
            const initialBalance = await token.balanceOf(user1.address);
            await token.connect(user1).requestTokens();
            const finalBalance = await token.balanceOf(user1.address);
            
            expect(finalBalance - initialBalance).to.equal(ethers.parseEther("1000"));
        });

        it("Should prevent requests before cooldown period", async function () {
            await token.connect(user1).requestTokens();
            
            await expect(
                token.connect(user1).requestTokens()
            ).to.be.revertedWith("Wait for cooldown period");
        });

        it("Should allow requests after cooldown period", async function () {
            await token.connect(user1).requestTokens();
            
            // Advance time by 12 hours
            await ethers.provider.send("evm_increaseTime", [12 * 3600]);
            await ethers.provider.send("evm_mine");
            
            await token.connect(user1).requestTokens();
            
            const balance = await token.balanceOf(user1.address);
            expect(balance).to.equal(ethers.parseEther("2000")); // 2 requests = 2000 tokens
        });

        it("Should fail when faucet has insufficient balance", async function () {
            // First, let's get the faucet's address
            const faucetAddress = await token.getAddress();
            
            // Now let's drain the faucet by having it send all its tokens to the owner
            const faucetBalance = await token.balanceOf(faucetAddress);
            await token.connect(owner).fundFaucet(-faucetBalance);
            
            // Verify faucet is empty
            expect(await token.balanceOf(faucetAddress)).to.equal(0);
            
            // Now try to request tokens, which should fail
            await expect(
                token.connect(user1).requestTokens()
            ).to.be.revertedWith("Insufficient faucet balance");
        });
    });

    describe("Owner Controls", function () {
        it("Should allow owner to update faucet parameters", async function () {
            const newAmount = ethers.parseEther("500"); // 500 tokens
            const newInterval = 6 * 3600; // 6 hours
            
            await token.updateFaucetParameters(newAmount, newInterval);
            
            expect(await token.faucetAmount()).to.equal(newAmount);
            expect(await token.faucetInterval()).to.equal(newInterval);
        });

        it("Should prevent non-owner from updating faucet parameters", async function () {
            await expect(
                token.connect(user1).updateFaucetParameters(
                    ethers.parseEther("500"),
                    6 * 3600
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Time Tracking", function () {
        it("Should correctly track time until next request", async function () {
            await token.connect(user1).requestTokens();
            
            const timeUntilNext = await token.getTimeUntilNextRequest(user1.address);
            expect(timeUntilNext).to.be.closeTo(12 * 3600, 5); // 12 hours, with 5 second tolerance
            
            // Advance time by 6 hours
            await ethers.provider.send("evm_increaseTime", [6 * 3600]);
            await ethers.provider.send("evm_mine");
            
            const timeRemaining = await token.getTimeUntilNextRequest(user1.address);
            expect(timeRemaining).to.be.closeTo(6 * 3600, 5); // 6 hours remaining
        });

        it("Should return 0 when user can request tokens", async function () {
            const timeUntilNext = await token.getTimeUntilNextRequest(user1.address);
            expect(timeUntilNext).to.equal(0);
        });
    });
}); 