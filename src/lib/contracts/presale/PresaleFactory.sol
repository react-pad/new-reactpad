// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LaunchpadPresale, PresaleConfig} from "./LaunchpadPresale.sol";

contract PresaleFactory {
    struct CreateParams {
        address saleToken;
        address paymentToken; // zero address for ETH
        PresaleConfig config;
        address owner;
    }

    address[] public allPresales;
    mapping(address => address[]) private _presalesByCreator;

    event PresaleCreated(
        address indexed creator,
        address indexed presale,
        address indexed saleToken,
        address paymentToken
    );

    function createPresale(CreateParams calldata params) external returns (address presale) {
        require(params.saleToken != address(0), "sale token required");
        require(params.config.endTime > params.config.startTime, "invalid schedule");

        address owner = params.owner == address(0) ? msg.sender : params.owner;
        presale = address(
            new LaunchpadPresale(IERC20(params.saleToken), params.paymentToken, params.config, owner)
        );

        allPresales.push(presale);
        _presalesByCreator[msg.sender].push(presale);

        emit PresaleCreated(msg.sender, presale, params.saleToken, params.paymentToken);
    }

    function totalPresales() external view returns (uint256) {
        return allPresales.length;
    }

    function presalesCreatedBy(address creator) external view returns (address[] memory) {
        return _presalesByCreator[creator];
    }
}