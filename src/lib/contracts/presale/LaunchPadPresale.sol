// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

struct PresaleConfig {
    uint64 startTime;
    uint64 endTime;
    uint256 rate; // Token amount per payment unit, scaled by 100 for 2 decimals
    uint256 softCap;
    uint256 hardCap;
    uint256 minContribution;
    uint256 maxContribution;
}

contract LaunchpadPresale is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error SaleNotActive();
    error SaleEnded();
    error InvalidAmount();
    error HardCapReached();
    error ClaimNotEnabled();
    error RefundsNotEnabled();
    error AlreadyFinalized();
    error NothingToClaim();

    uint256 public constant RATE_DIVISOR = 100;

    IERC20 public immutable saleToken;
    IERC20 public immutable paymentToken;
    bool public immutable isPaymentETH;

    uint64 public startTime;
    uint64 public endTime;
    uint256 public rate;
    uint256 public softCap;
    uint256 public hardCap;
    uint256 public minContribution;
    uint256 public maxContribution;

    uint256 public totalRaised;
    uint256 public committedTokens;
    uint256 public totalTokensDeposited;
    uint256 public proceedsClaimed;
    uint256 public tokensWithdrawn;

    bool public claimEnabled;
    bool public refundsEnabled;

    mapping(address => uint256) public contributions;
    mapping(address => uint256) public purchasedTokens;

    event ContributionReceived(address indexed buyer, uint256 paymentAmount, uint256 tokenAmount);
    event TokensClaimed(address indexed buyer, uint256 amount);
    event RefundClaimed(address indexed buyer, uint256 amount);
    event PresaleFinalized(bool successful);
    event ConfigUpdated(PresaleConfig config);
    event TokensDeposited(uint256 amount);
    event TokensWithdrawn(uint256 amount);
    event ProceedsWithdrawn(uint256 amount);

    constructor(IERC20 saleToken_, address paymentToken_, PresaleConfig memory config, address owner_) Ownable(owner_) {
        require(address(saleToken_) != address(0), "invalid sale token");
        saleToken = saleToken_;
        paymentToken = IERC20(paymentToken_);
        isPaymentETH = paymentToken_ == address(0);
        _setConfig(config);
    }

    function contribute(uint256 amount) external payable nonReentrant {
        if (claimEnabled || refundsEnabled) revert SaleEnded();
        if (block.timestamp < startTime || block.timestamp > endTime) revert SaleNotActive();

        uint256 paymentAmount = isPaymentETH ? msg.value : amount;
        if (paymentAmount == 0) revert InvalidAmount();
        if (isPaymentETH && amount != 0) revert InvalidAmount();
        if (!isPaymentETH && msg.value != 0) revert InvalidAmount();

        if (minContribution != 0 && paymentAmount < minContribution) revert InvalidAmount();
        uint256 newContribution = contributions[msg.sender] + paymentAmount;
        if (maxContribution != 0 && newContribution > maxContribution) revert InvalidAmount();
        if (hardCap != 0 && totalRaised + paymentAmount > hardCap) revert HardCapReached();

        uint256 tokenAmount = _convert(paymentAmount);
        if (tokenAmount == 0) revert InvalidAmount();
        committedTokens += tokenAmount;
        if (totalTokensDeposited < committedTokens) revert InvalidAmount();

        contributions[msg.sender] = newContribution;
        purchasedTokens[msg.sender] += tokenAmount;

        if (!isPaymentETH) {
            paymentToken.safeTransferFrom(msg.sender, address(this), paymentAmount);
        }

        totalRaised += paymentAmount;
        emit ContributionReceived(msg.sender, paymentAmount, tokenAmount);
    }

    function depositSaleTokens(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        totalTokensDeposited += amount;
        saleToken.safeTransferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(amount);
    }

    function finalize() external onlyOwner {
        if (claimEnabled || refundsEnabled) revert AlreadyFinalized();
        if (block.timestamp < endTime) revert SaleNotActive();

        if (totalRaised >= softCap && committedTokens > 0) {
            require(totalTokensDeposited >= committedTokens, "missing tokens");
            claimEnabled = true;
            emit PresaleFinalized(true);
        } else {
            refundsEnabled = true;
            emit PresaleFinalized(false);
        }
    }

    function cancelPresale() external onlyOwner {
        if (claimEnabled) revert AlreadyFinalized();
        refundsEnabled = true;
        emit PresaleFinalized(false);
    }

    function claimTokens() external nonReentrant {
        if (!claimEnabled) revert ClaimNotEnabled();
        uint256 amount = purchasedTokens[msg.sender];
        if (amount == 0) revert NothingToClaim();
        purchasedTokens[msg.sender] = 0;
        committedTokens -= amount;
        saleToken.safeTransfer(msg.sender, amount);
        emit TokensClaimed(msg.sender, amount);
    }

    function claimRefund() external nonReentrant {
        if (!refundsEnabled) revert RefundsNotEnabled();
        uint256 paymentAmount = contributions[msg.sender];
        if (paymentAmount == 0) revert NothingToClaim();
        contributions[msg.sender] = 0;
        uint256 amount = purchasedTokens[msg.sender];
        purchasedTokens[msg.sender] = 0;
        if (amount > 0) {
            committedTokens -= amount;
        }
        if (isPaymentETH) {
            (bool ok,) = msg.sender.call{value: paymentAmount}("");
            require(ok, "REFUND_FAILED");
        } else {
            paymentToken.safeTransfer(msg.sender, paymentAmount);
        }
        emit RefundClaimed(msg.sender, paymentAmount);
    }

    function withdrawProceeds(uint256 amount) external onlyOwner {
        if (!claimEnabled) revert ClaimNotEnabled();
        uint256 claimable = totalRaised - proceedsClaimed;
        if (amount == 0) amount = claimable;
        require(amount <= claimable, "amount too high");
        proceedsClaimed += amount;
        if (isPaymentETH) {
            (bool ok,) = owner().call{value: amount}("");
            require(ok, "WITHDRAW_FAILED");
        } else {
            paymentToken.safeTransfer(owner(), amount);
        }
        emit ProceedsWithdrawn(amount);
    }

    function withdrawUnusedTokens(uint256 amount) external onlyOwner {
        if (totalTokensDeposited < committedTokens) revert InvalidAmount();
        uint256 available = totalTokensDeposited - committedTokens - tokensWithdrawn;
        if (amount == 0) amount = available;
        require(amount <= available, "amount too high");
        tokensWithdrawn += amount;
        saleToken.safeTransfer(owner(), amount);
        emit TokensWithdrawn(amount);
    }

    function updateConfig(PresaleConfig memory config) external onlyOwner {
        if (block.timestamp >= startTime) revert AlreadyFinalized();
        _setConfig(config);
    }

    function _convert(uint256 paymentAmount) internal view returns (uint256) {
        return (paymentAmount * rate) / RATE_DIVISOR;
    }

    function _setConfig(PresaleConfig memory config) internal {
        if (config.endTime <= config.startTime) revert InvalidAmount();
        if (config.rate == 0) revert InvalidAmount();
        rate = config.rate;
        softCap = config.softCap;
        hardCap = config.hardCap;
        minContribution = config.minContribution;
        maxContribution = config.maxContribution;
        startTime = config.startTime;
        endTime = config.endTime;
        emit ConfigUpdated(config);
    }
}
