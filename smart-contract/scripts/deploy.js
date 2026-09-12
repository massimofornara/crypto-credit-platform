const hre = require("hardhat");

async function main() {
  const CreditExchange = await hre.ethers.getContractFactory("CreditExchange");
  const creditExchange = await CreditExchange.deploy();
  await creditExchange.deployed();

  console.log("CreditExchange deployed to:", creditExchange.address);

  const usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  await creditExchange.addSupportedToken(usdtAddress);
  console.log("USDT added as supported token");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
