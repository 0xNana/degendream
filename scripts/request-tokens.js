const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    // Get token address from environment
    const DD_TOKEN_ADDRESS = process.env.DD_TOKEN;
    if (!DD_TOKEN_ADDRESS) {
        throw new Error("Please set DD_TOKEN in your .env file");
    }

    // Target address
    const targetAddress = "0x82e5904bE1c61B7F2bfAa222D8B54919774D0716";

    // Get the token contract
    const DegenDreamToken = await ethers.getContractFactory("DegenDreamToken");
    const token = DegenDreamToken.attach(DD_TOKEN_ADDRESS);

    console.log("Requesting tokens for address:", targetAddress);

    // Check current balance
    const balanceBefore = await token.balanceOf(targetAddress);
    console.log("Current balance:", ethers.formatEther(balanceBefore), "DD");

    // Check faucet balance
    const faucetBalance = await token.balanceOf(DD_TOKEN_ADDRESS);
    console.log("Faucet balance:", ethers.formatEther(faucetBalance), "DD");

    // Request tokens
    console.log("\nRequesting tokens from faucet...");
    const tx = await token.requestTokens();
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait(1);
    console.log("Tokens received successfully!");

    // Check new balance
    const balanceAfter = await token.balanceOf(targetAddress);
    console.log("\nNew balance:", ethers.formatEther(balanceAfter), "DD");
    console.log("Received:", ethers.formatEther(balanceAfter - balanceBefore), "DD");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 