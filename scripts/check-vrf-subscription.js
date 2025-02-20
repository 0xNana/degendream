const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const VRF_COORDINATOR = process.env.CHAINLINK_VRF_COORDINATOR;
    const SUBSCRIPTION_ID = process.env.CHAINLINK_SUBSCRIPTION_ID;
    const DREAM_ADDRESS = process.env.DEGEN_DREAM_CONTRACT;

    // VRF Coordinator V2.5 Interface
    const coordinator = await ethers.getContractAt(
        ["function getSubscription(uint256 subId) view returns (uint96, uint64, address, address[])"],
        VRF_COORDINATOR
    );

    console.log("Checking VRF Subscription...");
    console.log("Subscription ID:", SUBSCRIPTION_ID);
    console.log("DegenDream Contract:", DREAM_ADDRESS);

    try {
        const [balance, reqCount, owner, consumers] = await coordinator.getSubscription(SUBSCRIPTION_ID);
        
        console.log("\nSubscription Details:");
        console.log("Balance:", ethers.formatEther(balance), "LINK");
        console.log("Request Count:", reqCount.toString());
        console.log("Owner:", owner);
        console.log("\nConsumers:");
        for (const consumer of consumers) {
            console.log("-", consumer);
            if (consumer.toLowerCase() === DREAM_ADDRESS.toLowerCase()) {
                console.log("  ✓ DegenDream is properly registered as consumer");
            }
        }

        // Check if our contract is registered
        const isRegistered = consumers.some(c => c.toLowerCase() === DREAM_ADDRESS.toLowerCase());
        if (!isRegistered) {
            console.log("\n❌ WARNING: DegenDream contract is not registered as a consumer!");
            console.log("The contract needs to be added to the subscription before it can request random numbers.");
        }
    } catch (error) {
        console.error("Error checking subscription:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 