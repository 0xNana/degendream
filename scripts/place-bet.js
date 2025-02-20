const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Contract addresses from environment
    const DREAM_ADDRESS = process.env.DEGEN_DREAM_CONTRACT;
    const DD_TOKEN_ADDRESS = process.env.DD_TOKEN;

    if (!DREAM_ADDRESS || !DD_TOKEN_ADDRESS) {
        throw new Error("Please set DEGEN_DREAM_CONTRACT and DD_TOKEN in your .env file");
    }

    // Target address
    const targetAddress = "0x82e5904bE1c61B7F2bfAa222D8B54919774D0716";

    // Get the contracts
    const DegenDream = await ethers.getContractFactory("DegenDream");
    const dream = DegenDream.attach(DREAM_ADDRESS);
    
    const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
    const token = DegenDreamToken.attach(DD_TOKEN_ADDRESS);

    console.log("Betting from address:", targetAddress);

    // Check token balance
    const balance = await token.balanceOf(targetAddress);
    console.log("Current DD balance:", ethers.formatEther(balance), "DD");

    // Get contract parameters
    const maxBet = await dream.MAX_BET();
    console.log("Maximum bet:", ethers.formatEther(maxBet), "DD");

    // Check token allowance
    const allowance = await token.allowance(targetAddress, DREAM_ADDRESS);
    console.log("Current allowance:", ethers.formatEther(allowance), "DD");
    
    // Always approve a fresh allowance to ensure we have enough
    console.log("Approving DD token for betting...");
    const approveTx = await token.connect(targetAddress).approve(DREAM_ADDRESS, ethers.MaxUint256);
    await approveTx.wait(1);
    console.log("Token approved successfully");

    // Place bet with maximum amount
    const betAmount = maxBet;
    const numbers = [7, 14, 28, 42, 77, 99]; // Lucky numbers!

    console.log("\nPlacing bet...");
    console.log("Amount:", ethers.formatEther(betAmount), "DD");
    console.log("Numbers:", numbers.join(", "));

    const tx = await dream.connect(targetAddress).placeBet(betAmount, numbers);
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait(1);
    console.log("Bet placed successfully!");

    // Get the request ID from the event
    const betPlacedEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "BetPlaced"
    );

    if (betPlacedEvent) {
        const [requestId, player, amount, betNumbers] = betPlacedEvent.args;
        console.log("\nBet Details:");
        console.log("Request ID:", requestId);
        console.log("Player:", player);
        console.log("Amount:", ethers.formatEther(amount), "DD");
        console.log("Numbers:", betNumbers.join(", "));

        // Monitor for VRF fulfillment
        console.log("\nWaiting for VRF response...");
        const filter = dream.filters.NumbersDrawn(requestId);
        
        // Set up event listener
        dream.once(filter, async (reqId, winningNumbers, event) => {
            console.log("\nVRF Response Received!");
            console.log("Winning Numbers:", winningNumbers.map(n => n.toString()).join(", "));
            
            // Get bet results
            const bet = await dream.getBet(requestId);
            console.log("\nBet Results:");
            console.log("Matches:", bet.matches);
            console.log("Payout:", ethers.formatEther(bet.payout), "DD");
            
            // Exit after receiving results
            process.exit(0);
        });

        // Keep script running to wait for event
        console.log("Waiting for results (press Ctrl+C to exit)...");
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 