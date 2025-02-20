const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const DREAM_ADDRESS = process.env.DEGEN_DREAM_CONTRACT;
    
    // The request ID from our previous bet
    const requestId = "101932008532810537084789815094337193551787353888561642769135937505459769864385";

    // Get the contract
    const DegenDream = await ethers.getContractFactory("DegenDream");
    const dream = DegenDream.attach(DREAM_ADDRESS);

    console.log("Checking bet results for Request ID:", requestId);
    
    try {
        // Get bet details from state
        const bet = await dream.getBet(requestId);
        console.log("\nBet Details:");
        console.log("Player:", bet.player);
        console.log("Amount:", ethers.formatEther(bet.amount), "DD");
        console.log("Your Numbers:", bet.numbers.map(n => n.toString()).join(", "));
        console.log("Processed:", bet.processed);
        console.log("Matches:", bet.matches.toString());
        console.log("Payout:", ethers.formatEther(bet.payout), "DD");

        // Get the block number of the bet placement
        const filter = dream.filters.BetPlaced(requestId);
        const betEvents = await dream.queryFilter(filter);
        if (betEvents.length > 0) {
            const betBlock = betEvents[0].blockNumber;
            
            // Get winning numbers from NumbersDrawn event
            const drawFilter = dream.filters.NumbersDrawn(requestId);
            const drawEvents = await dream.queryFilter(drawFilter, betBlock);
            if (drawEvents.length > 0) {
                const winningNumbers = drawEvents[0].args[1];
                console.log("\nWinning Numbers:", winningNumbers.map(n => n.toString()).join(", "));
                
                // Show which numbers matched
                const matches = bet.numbers.filter(num => 
                    winningNumbers.some(win => win.toString() === num.toString())
                );
                if (matches.length > 0) {
                    console.log("\nMatching Numbers:", matches.map(n => n.toString()).join(", "));
                }
            }
        }

    } catch (error) {
        console.error("Error checking bet:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 