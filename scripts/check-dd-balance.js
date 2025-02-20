const { ethers } = require("hardhat");

async function main() {
    const tokenAddress = "0x2C1b768C4AaebA9B3Fa0D3520906A370cef9E589";
    
    // Get the token contract
    const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
    const token = DegenDreamToken.attach(tokenAddress);

    // Get the deployer
    const [deployer] = await ethers.getSigners();
    
    // Check balances
    const deployerBalance = await token.balanceOf(deployer.address);
    const faucetBalance = await token.balanceOf(tokenAddress);
    const totalSupply = await token.totalSupply();
    
    console.log("\nToken Information:");
    console.log("------------------");
    console.log("Token Address:", tokenAddress);
    console.log("Total Supply:", ethers.formatEther(totalSupply), "DD");
    
    console.log("\nToken Distribution:");
    console.log("-------------------");
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", ethers.formatEther(deployerBalance), "DD");
    console.log("Faucet Balance:", ethers.formatEther(faucetBalance), "DD");
    
    // Check faucet parameters
    const faucetAmount = await token.faucetAmount();
    const faucetInterval = await token.faucetInterval();
    
    console.log("\nFaucet Parameters:");
    console.log("-----------------");
    console.log("Faucet Amount per Request:", ethers.formatEther(faucetAmount), "DD");
    console.log("Faucet Interval:", Number(faucetInterval) / 3600, "hours");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 