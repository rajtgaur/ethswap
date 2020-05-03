const EthSwap = artifacts.require("EthSwap");
const RGToken = artifacts.require("RGToken");

module.exports = async function(deployer) {
	// Deploy Token
	await deployer.deploy(RGToken);
	const token = await RGToken.deployed()
	// Deploy EthSwap
 	await deployer.deploy(EthSwap, token.address);
 	const ethSwap = await EthSwap.deployed()

 	// Transfre token to EthSwap exchage - 1 Million
 	await token.transfer(ethSwap.address, '1000000000000000000000000')
};
