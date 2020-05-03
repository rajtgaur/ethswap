pragma solidity ^0.5.0;

import './RGToken.sol';

contract EthSwap {
	string public name = "EthSwap Instant Exchange";
	RGToken public token; // variable to be used to call methhods on Token contract
	uint256 public rate = 100;

	//Events
	event TokensPurchased(
		address account,
		address token,
		uint256 amount,
		uint256 rate
	);
	event TokensSold(
		address account,
		address token,
		uint256 amount,
		uint256 rate
	);

	constructor(RGToken _token) public {
		token = _token;
	}

	function buyTokens() public payable {
		// calculate the number of tokens to buy
		uint256 tokenAmount = msg.value * rate;
		// require that EthSwap has enough tokens
		require(token.balanceOf(address(this)) >= tokenAmount);
		// transfer tokens to the user
		token.transfer(msg.sender, tokenAmount);
		// emit an event
		emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
	}

	function sellTokens(uint256 _amount) public {
		// user can't sell more tokens that they have
		require(token.balanceOf(msg.sender) >= _amount);

		// calculate the amount of ether to redeem
		uint256 etherAmount = _amount / rate;
		// require that EthSwap has anough ether
		require(address(this).balance >= etherAmount);
		// perform sale
		token.transferFrom(msg.sender, address(this), _amount);
		msg.sender.transfer(etherAmount);
		// emit an event
		emit TokensSold(msg.sender, address(token), _amount, rate);
	}
}