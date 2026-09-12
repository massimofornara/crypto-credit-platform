// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreditExchange is Ownable {
    mapping(address => uint256) public credits;
    mapping(address => bool) public isSupportedToken;
    address[] public supportedTokens;
    address public backendAddress = 0x0000000000000000000000000000000000000001;

    event CreditsDeposited(address indexed user, uint256 amount);
    event CreditsWithdrawn(address indexed user, uint256 amount, address token);

    constructor() {
        _addSupportedToken(0xc2132D05D31c914a87C6611C10748AEb04B58e8F);
    }

    modifier onlyOwnerOrBackend() {
        require(
            msg.sender == owner() || msg.sender == backendAddress,
            "Only owner or backend"
        );
        _;
    }

    function setBackendAddress(address _newBackend) external onlyOwner {
        backendAddress = _newBackend;
    }

    function _addSupportedToken(address token) internal {
        require(!isSupportedToken[token], "Token already supported");
        supportedTokens.push(token);
        isSupportedToken[token] = true;
    }

    function addSupportedToken(address token) external onlyOwner {
        _addSupportedToken(token);
    }

    function depositCredits(address user, uint256 amount) external onlyOwnerOrBackend {
        credits[user] += amount;
        emit CreditsDeposited(user, amount);
    }

    function withdrawCredits(uint256 amount, address token) external {
        require(credits[msg.sender] >= amount, "Insufficient credits");
        require(isSupportedToken[token], "Token not supported");

        credits[msg.sender] -= amount;
        IERC20(token).transfer(msg.sender, amount);

        emit CreditsWithdrawn(msg.sender, amount, token);
    }

    function getCreditsBalance(address user) external view returns (uint256) {
        return credits[user];
    }
}
