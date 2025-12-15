// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {
    LaunchpadERC20,
    LaunchpadERC20Mintable,
    LaunchpadERC20Burnable,
    LaunchpadERC20Taxable,
    LaunchpadERC20Plain,
    LaunchpadERC20NonMintable,
    TokenInitConfig
} from "./LaunchpadTokens.sol";

contract TokenFactory {
    enum TokenType {
        Plain,
        Mintable,
        Burnable,
        Taxable,
        NonMintable
    }

    struct TokenParams {
        string name;
        string symbol;
        uint8 decimals;
        uint256 initialSupply;
        address initialRecipient;
    }

    struct TaxParams {
        address taxWallet;
        uint96 taxBps;
    }

    struct TokenRecord {
        address token;
        TokenType tokenType;
        address creator;
    }

    TokenRecord[] public deployments;
    mapping(address => address[]) private _tokensByCreator;

    event TokenCreated(address indexed creator, address indexed token, TokenType indexed tokenType);

    function createPlainToken(TokenParams calldata params) external returns (address token) {
        token = address(new LaunchpadERC20Plain(_buildInit(params, msg.sender)));
        _register(token, TokenType.Plain);
    }

    function createMintableToken(TokenParams calldata params) external returns (address token) {
        token = address(new LaunchpadERC20Mintable(_buildInit(params, msg.sender)));
        _register(token, TokenType.Mintable);
    }

    function createBurnableToken(TokenParams calldata params) external returns (address token) {
        token = address(new LaunchpadERC20Burnable(_buildInit(params, msg.sender)));
        _register(token, TokenType.Burnable);
    }

    function createTaxableToken(TokenParams calldata params, TaxParams calldata tax) external returns (address token) {
        require(tax.taxWallet != address(0), "tax wallet required");
        token = address(new LaunchpadERC20Taxable(_buildInit(params, msg.sender), tax.taxWallet, tax.taxBps));
        _register(token, TokenType.Taxable);
    }

    function createNonMintableToken(TokenParams calldata params) external returns (address token) {
        token = address(new LaunchpadERC20NonMintable(_buildInit(params, msg.sender)));
        _register(token, TokenType.NonMintable);
    }

    function totalDeployments() external view returns (uint256) {
        return deployments.length;
    }

    function tokensCreatedBy(address creator) external view returns (address[] memory) {
        return _tokensByCreator[creator];
    }

    function _register(address token, TokenType tokenType) private {
        deployments.push(TokenRecord({token: token, tokenType: tokenType, creator: msg.sender}));
        _tokensByCreator[msg.sender].push(token);
        emit TokenCreated(msg.sender, token, tokenType);
    }

    function _buildInit(TokenParams calldata params, address owner) private pure returns (TokenInitConfig memory init) {
        init.name = params.name;
        init.symbol = params.symbol;
        init.decimals = params.decimals;
        init.initialSupply = params.initialSupply;
        init.initialOwner = owner;
        init.initialRecipient = params.initialRecipient == address(0) ? owner : params.initialRecipient;
    }
}
