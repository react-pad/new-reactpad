// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenLocker {
    using SafeERC20 for IERC20;

    error InvalidToken();
    error InvalidAmount();
    error NotOwner();
    error LockNotExpired();
    error AlreadyUnlocked();

    struct LockInfo {
        address token;
        address owner;
        uint256 amount;
        uint64 lockDate;
        uint64 unlockDate;
        bool withdrawn;
        string name;
        string description;
    }

    LockInfo[] private _locks;

    event LockCreated(
        uint256 indexed lockId, address indexed token, address indexed owner, uint256 amount, uint64 unlockDate
    );
    event LockExtended(uint256 indexed lockId, uint64 newUnlockDate);
    event LockTransferred(uint256 indexed lockId, address indexed newOwner);
    event LockReleased(uint256 indexed lockId, uint256 amount);

    function lockTokens(
        address token,
        uint256 amount,
        uint64 lockDuration,
        string calldata name,
        string calldata description
    ) external returns (uint256 lockId) {
        if (token == address(0)) revert InvalidToken();
        if (amount == 0 || lockDuration == 0) revert InvalidAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        lockId = _locks.length;
        uint64 unlockDate = uint64(block.timestamp) + lockDuration;

        _locks.push(
            LockInfo({
                token: token,
                owner: msg.sender,
                amount: amount,
                lockDate: uint64(block.timestamp),
                unlockDate: unlockDate,
                withdrawn: false,
                name: name,
                description: description
            })
        );

        emit LockCreated(lockId, token, msg.sender, amount, unlockDate);
    }

    function extendLock(uint256 lockId, uint64 additionalTime) external {
        LockInfo storage info = _locks[lockId];
        if (info.owner != msg.sender) revert NotOwner();
        if (info.withdrawn) revert AlreadyUnlocked();
        if (additionalTime == 0) revert InvalidAmount();
        info.unlockDate += additionalTime;
        emit LockExtended(lockId, info.unlockDate);
    }

    function transferLockOwnership(uint256 lockId, address newOwner) external {
        if (newOwner == address(0)) revert InvalidToken();
        LockInfo storage info = _locks[lockId];
        if (info.owner != msg.sender) revert NotOwner();
        info.owner = newOwner;
        emit LockTransferred(lockId, newOwner);
    }

    function unlock(uint256 lockId) external {
        LockInfo storage info = _locks[lockId];
        if (info.owner != msg.sender) revert NotOwner();
        if (info.withdrawn) revert AlreadyUnlocked();
        if (block.timestamp < info.unlockDate) revert LockNotExpired();

        info.withdrawn = true;
        IERC20(info.token).safeTransfer(msg.sender, info.amount);
        emit LockReleased(lockId, info.amount);
    }

    function getLock(uint256 lockId) external view returns (LockInfo memory) {
        return _locks[lockId];
    }

    function totalLocks() external view returns (uint256) {
        return _locks.length;
    }

    function locksOfOwner(address owner) external view returns (uint256[] memory lockIds) {
        uint256 total = _locks.length;
        uint256 count;
        for (uint256 i = 0; i < total; i++) {
            if (_locks[i].owner == owner) {
                count++;
            }
        }
        lockIds = new uint256[](count);
        uint256 idx;
        for (uint256 i = 0; i < total; i++) {
            if (_locks[i].owner == owner) {
                lockIds[idx++] = i;
            }
        }
    }
}
