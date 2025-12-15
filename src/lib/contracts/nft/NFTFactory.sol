// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {LaunchpadNFTUSDC, LaunchpadNFTEth, MintConfig, NFTInitConfig} from "./NFTSales.sol";

contract NFTFactory {
    struct NFTParams {
        string name;
        string symbol;
        string baseURI;
        uint256 maxSupply;
        address payoutWallet;
        MintConfig mintConfig;
    }

    struct NFTRecord {
        address nft;
        bool acceptsEth;
        address creator;
    }

    NFTRecord[] public deployments;
    mapping(address => address[]) private _nftsByCreator;

    event NFTCreated(address indexed creator, address indexed nft, bool indexed acceptsEth);

    function createUSDCNFT(NFTParams calldata params, IERC20 paymentToken) external returns (address nft) {
        require(address(paymentToken) != address(0), "payment token required");
        nft = address(new LaunchpadNFTUSDC(_buildInit(params), paymentToken));
        _register(nft, false);
    }

    function createETHNFT(NFTParams calldata params) external returns (address nft) {
        nft = address(new LaunchpadNFTEth(_buildInit(params)));
        _register(nft, true);
    }

    function tokensCreatedBy(address creator) external view returns (address[] memory) {
        return _nftsByCreator[creator];
    }

    function totalDeployments() external view returns (uint256) {
        return deployments.length;
    }

    function _register(address nft, bool acceptsEth) private {
        deployments.push(NFTRecord({nft: nft, acceptsEth: acceptsEth, creator: msg.sender}));
        _nftsByCreator[msg.sender].push(nft);
        emit NFTCreated(msg.sender, nft, acceptsEth);
    }

    function _buildInit(NFTParams calldata params) private view returns (NFTInitConfig memory init) {
        init.name = params.name;
        init.symbol = params.symbol;
        init.baseURI = params.baseURI;
        init.maxSupply = params.maxSupply;
        init.owner = msg.sender;
        init.payoutWallet = params.payoutWallet == address(0) ? msg.sender : params.payoutWallet;
        init.mintConfig = params.mintConfig;
    }
}
