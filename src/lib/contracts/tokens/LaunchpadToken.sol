// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Shared configuration used by every launchpad token deployment.
struct TokenInitConfig {
    string name;
    string symbol;
    uint8 decimals;
    uint256 initialSupply;
    address initialOwner;
    address initialRecipient;
}

/// @notice Base contract that all launchpad token flavours inherit from.
abstract contract LaunchpadERC20 is ERC20, Ownable {
    error InvalidRecipient();

    uint8 private immutable _tokenDecimals;

    constructor(TokenInitConfig memory init) ERC20(init.name, init.symbol) Ownable(init.initialOwner) {
        address receiver = init.initialRecipient == address(0) ? init.initialOwner : init.initialRecipient;
        if (receiver == address(0)) revert InvalidRecipient();

        _tokenDecimals = init.decimals;

        if (init.initialSupply > 0) {
            _mint(receiver, init.initialSupply);
        }
    }

    function decimals() public view override returns (uint8) {
        return _tokenDecimals;
    }
}

/// @notice Basic fixed supply token with no additional hooks.
contract LaunchpadERC20Plain is LaunchpadERC20 {
    constructor(TokenInitConfig memory init) LaunchpadERC20(init) {}
}

/// @notice Adds owner-controlled minting on top of the base token.
contract LaunchpadERC20Mintable is LaunchpadERC20 {
    constructor(TokenInitConfig memory init) LaunchpadERC20(init) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/// @notice Adds public burning in addition to the base behaviour.
contract LaunchpadERC20Burnable is LaunchpadERC20 {
    constructor(TokenInitConfig memory init) LaunchpadERC20(init) {}

    function burn(uint256 value) external {
        _burn(_msgSender(), value);
    }

    function burnFrom(address account, uint256 value) external {
        _spendAllowance(account, _msgSender(), value);
        _burn(account, value);
    }
}

/// @notice Launchpad token variant that collects transfer taxes.
contract LaunchpadERC20Taxable is LaunchpadERC20 {
    error TaxTooHigh();
    error InvalidTaxWallet();

    uint96 public constant BPS_DENOMINATOR = 10_000;

    address public taxWallet;
    uint96 public taxBps; // e.g. 1% = 100 bps, 5% = 500 bps, 10% = 1_000 bps
    mapping(address => bool) public isTaxExempt;

    event TaxWalletUpdated(address indexed newWallet);
    event TaxUpdated(uint96 newTaxBps);
    event TaxExemptionUpdated(address indexed account, bool isExempt);

    constructor(TokenInitConfig memory init, address taxWallet_, uint96 taxBps_) LaunchpadERC20(init) {
        if (taxWallet_ == address(0)) revert InvalidTaxWallet();
        taxWallet = taxWallet_;
        _updateTax(taxBps_);
        _setTaxExempt(address(0), true);
        _setTaxExempt(taxWallet_, true);
        _setTaxExempt(address(this), true);
        _setTaxExempt(_msgSender(), true);
        _setTaxExempt(init.initialOwner, true);
        _setTaxExempt(init.initialRecipient, true);
    }

    function setTaxWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert InvalidTaxWallet();
        taxWallet = newWallet;
        _setTaxExempt(newWallet, true);
        emit TaxWalletUpdated(newWallet);
    }

    function setTax(uint96 newTaxBps) external onlyOwner {
        _updateTax(newTaxBps);
    }

    function setTaxExemption(address account, bool exempt) external onlyOwner {
        _setTaxExempt(account, exempt);
    }

    function _update(address from, address to, uint256 value) internal override {
        if (taxBps > 0 && from != address(0) && to != address(0) && !isTaxExempt[from] && !isTaxExempt[to]) {
            uint256 fee = (value * taxBps) / BPS_DENOMINATOR;
            uint256 remainder = value - fee;
            super._update(from, taxWallet, fee);
            super._update(from, to, remainder);
        } else {
            super._update(from, to, value);
        }
    }

    function _updateTax(uint96 newTaxBps) private {
        if (newTaxBps > 2_000) revert TaxTooHigh();
        taxBps = newTaxBps;
        emit TaxUpdated(newTaxBps);
    }

    function _setTaxExempt(address account, bool exempt) private {
        isTaxExempt[account] = exempt;
        emit TaxExemptionUpdated(account, exempt);
    }
}

/// @notice Fixed supply variant that renounces ownership on deployment.
contract LaunchpadERC20NonMintable is LaunchpadERC20 {
    constructor(TokenInitConfig memory init) LaunchpadERC20(init) {
        _transferOwnership(address(0));
    }
}
