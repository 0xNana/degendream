import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy LD Token first
    console.log("\nDeploying LD Token...");
    const LDToken = await ethers.getContractFactory("LDToken");
    const ldToken = await LDToken.deploy();
    await ldToken.waitForDeployment();
    console.log("LD Token deployed to:", await ldToken.getAddress());

    // Deploy VRF Coordinator (for testing)
    console.log("\nDeploying VRF Coordinator Mock...");
    const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    const vrfCoordinator = await VRFCoordinatorV2Mock.deploy(0, 0);
    await vrfCoordinator.waitForDeployment();
    console.log("VRF Coordinator deployed to:", await vrfCoordinator.getAddress());

    // Create and fund VRF subscription
    console.log("\nCreating VRF subscription...");
    const createSubTx = await vrfCoordinator.createSubscription();
    const createSubReceipt = await createSubTx.wait();
    const subId = 1; // Fixed to 1 in our mock
    console.log("Subscription ID:", subId);

    // Fund subscription
    console.log("Funding subscription...");
    await vrfCoordinator.fundSubscription(subId, ethers.parseEther("10"));

    // Deploy DegenDream
    console.log("\nDeploying DegenDream...");
    const DegenDream = await ethers.getContractFactory("DegenDream");
    const degenDream = await DegenDream.deploy(
        await vrfCoordinator.getAddress(),
        ethers.ZeroHash, // keyHash (not used in mock)
        subId,
        await ldToken.getAddress(),
        deployer.address // treasury
    );
    await degenDream.waitForDeployment();
    console.log("DegenDream deployed to:", await degenDream.getAddress());

    // Add DegenDream as VRF consumer
    console.log("\nAdding DegenDream as VRF consumer...");
    await vrfCoordinator.addConsumer(subId, await degenDream.getAddress());

    // Fund prize pool
    console.log("\nFunding initial prize pool...");
    const initialPrizePool = ethers.parseUnits("1000000", 6); // 1M LD
    await ldToken.approve(await degenDream.getAddress(), initialPrizePool);
    await degenDream.addToPrizePool(initialPrizePool);
    console.log("Added", ethers.formatUnits(initialPrizePool, 6), "LD to prize pool");

    console.log("\nDeployment complete! Contract addresses:");
    console.log("LD Token:", await ldToken.getAddress());
    console.log("VRF Coordinator:", await vrfCoordinator.getAddress());
    console.log("DegenDream:", await degenDream.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 