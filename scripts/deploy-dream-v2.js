const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Contract addresses
    const DD_TOKEN_ADDRESS = process.env.DD_TOKEN;
    const VRF_COORDINATOR = process.env.CHAINLINK_VRF_COORDINATOR;
    const KEY_HASH = process.env.CHAINLINK_KEY_HASH;
    
    // Get subscription ID from .env
    if (!process.env.CHAINLINK_SUBSCRIPTION_ID) {
        throw new Error("Please set CHAINLINK_SUBSCRIPTION_ID in your .env file");
    }
    const SUBSCRIPTION_ID = BigInt(process.env.CHAINLINK_SUBSCRIPTION_ID);

    console.log("Deploying DegenDream with DD token...");
    console.log("VRF Coordinator V2.5:", VRF_COORDINATOR);
    console.log("Key Hash:", KEY_HASH);
    console.log("Subscription ID:", SUBSCRIPTION_ID.toString());

    // Get the DD token contract to verify it exists
    const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
    const ddToken = DegenDreamToken.attach(DD_TOKEN_ADDRESS);
    const tokenSymbol = await ddToken.symbol();
    console.log("Using token:", await ddToken.name(), `(${tokenSymbol})`);

    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Deploy DegenDream
    const DegenDream = await ethers.getContractFactory("DegenDream");
    const dream = await DegenDream.deploy(
        VRF_COORDINATOR,
        KEY_HASH,
        SUBSCRIPTION_ID,
        DD_TOKEN_ADDRESS,
        deployer.address // Treasury address (using deployer for now)
    );
    await dream.waitForDeployment();

    const dreamAddress = await dream.getAddress();
    console.log("DegenDream deployed to:", dreamAddress);

    // Wait for deployment to be confirmed
    console.log("Waiting for deployment to be confirmed...");
    await dream.deploymentTransaction().wait(6);
    console.log("Deployment confirmed");

    // Verify contract on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying contract on Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: dreamAddress,
                constructorArguments: [
                    VRF_COORDINATOR,
                    KEY_HASH,
                    SUBSCRIPTION_ID,
                    DD_TOKEN_ADDRESS,
                    deployer.address
                ],
            });
            console.log("Contract verified on Etherscan");
        } catch (error) {
            console.log("Verification failed:", error.message);
        }
    }

    // Print deployment summary
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("DegenDream Address:", dreamAddress);
    console.log("Betting Token (DD):", DD_TOKEN_ADDRESS);
    console.log("VRF Coordinator:", VRF_COORDINATOR);
    console.log("Key Hash:", KEY_HASH);
    console.log("Subscription ID:", SUBSCRIPTION_ID.toString());
    console.log("Treasury:", deployer.address);
    
    // Print betting parameters
    const minBet = await dream.MIN_BET();
    const maxBet = await dream.MAX_BET();
    console.log("\nBetting Parameters:");
    console.log("------------------");
    console.log("Minimum Bet:", ethers.formatEther(minBet), "DD");
    console.log("Maximum Bet:", ethers.formatEther(maxBet), "DD");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 