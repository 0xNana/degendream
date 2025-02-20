const { ethers, network } = require("hardhat");

async function main() {
    console.log("Deploying DegenDreamToken...");

    // Deploy the token contract
    const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
    const token = await DegenDreamToken.deploy();
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log("DegenDreamToken deployed to:", tokenAddress);

    // Wait for deployment transaction to be mined
    const deployTx = token.deploymentTransaction();
    console.log("Waiting for deployment transaction to be mined...");
    await deployTx.wait(6); // Wait for 6 block confirmations
    console.log("Deployment confirmed");

    // Fund the faucet with initial tokens (e.g., 1 million tokens)
    const INITIAL_FAUCET_FUNDING = ethers.parseEther("1000000"); // 1 million tokens
    console.log("Funding faucet with initial tokens...");
    const fundTx = await token.fundFaucet(INITIAL_FAUCET_FUNDING);
    await fundTx.wait(1); // Wait for 1 confirmation
    console.log("Faucet funded with", ethers.formatEther(INITIAL_FAUCET_FUNDING), "DD tokens");

    // Verify contract on Etherscan
    if (network.name !== "hardhat" && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying contract on Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: tokenAddress,
                constructorArguments: [],
            });
            console.log("Contract verified on Etherscan");
        } catch (error) {
            console.log("Verification failed:", error.message);
        }
    }

    // Log deployment info
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("Token Address:", tokenAddress);
    console.log("Total Supply:", ethers.formatEther(await token.totalSupply()), "DD");
    console.log("Faucet Amount:", ethers.formatEther(await token.faucetAmount()), "DD per request");
    console.log("Faucet Interval:", (await token.faucetInterval()) / 3600, "hours");

    // Check token distribution
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await token.balanceOf(deployer.address);
    const faucetBalance = await token.balanceOf(tokenAddress);
    
    console.log("\nToken Distribution:");
    console.log("-------------------");
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", ethers.formatEther(deployerBalance), "DD");
    console.log("Faucet Balance:", ethers.formatEther(faucetBalance), "DD");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 