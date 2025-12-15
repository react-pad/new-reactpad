// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AirdropMultisender {
    using SafeERC20 for IERC20;

    error LengthMismatch();
    error InvalidRecipient();
    error InvalidAmount();

    event TokensSent(address indexed token, uint256 totalAmount);
    event EthSent(uint256 totalAmount);

    function sendERC20(IERC20 token, address[] calldata recipients, uint256[] calldata amounts) external {
        if (recipients.length != amounts.length) revert LengthMismatch();
        uint256 total;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert InvalidRecipient();
            uint256 amount = amounts[i];
            if (amount == 0) revert InvalidAmount();
            total += amount;
            token.safeTransferFrom(msg.sender, recipients[i], amount);
        }
        emit TokensSent(address(token), total);
    }

    function sendETH(address[] calldata recipients, uint256[] calldata amounts) external payable {
        if (recipients.length != amounts.length) revert LengthMismatch();
        uint256 total;
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] == address(0)) revert InvalidRecipient();
            uint256 amount = amounts[i];
            if (amount == 0) revert InvalidAmount();
            total += amount;
        }
        if (total != msg.value) revert InvalidAmount();
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool ok,) = payable(recipients[i]).call{value: amounts[i]}("");
            require(ok, "transfer failed");
        }
        emit EthSent(total);
    }
}
