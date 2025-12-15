// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

struct MintConfig {
    uint64 saleStart;
    uint64 saleEnd;
    uint32 walletLimit;
    uint128 price;
}

struct NFTInitConfig {
    string name;
    string symbol;
    string baseURI;
    uint256 maxSupply;
    address owner;
    address payoutWallet;
    MintConfig mintConfig;
}

abstract contract LaunchpadNFTBase is ERC721, Ownable, ReentrancyGuard {
    error SaleNotStarted();
    error SaleEnded();
    error WalletLimitReached();
    error SoldOut();
    error InvalidConfig();
    error InvalidWallet();

    uint256 public immutable maxSupply;
    uint256 public totalMinted;
    uint128 public mintPrice;
    uint32 public walletLimit;
    uint64 public saleStart;
    uint64 public saleEnd;
    string private _baseTokenURI;
    uint256 internal _nextTokenId;
    address payable public payoutWallet;

    mapping(address => uint256) public mintedPerWallet;

    event MintConfigUpdated(MintConfig config);
    event BaseURIUpdated(string newBaseURI);
    event PayoutWalletUpdated(address indexed newWallet);

    constructor(NFTInitConfig memory init) ERC721(init.name, init.symbol) Ownable(init.owner) {
        if (init.maxSupply == 0) revert InvalidConfig();

        maxSupply = init.maxSupply;
        payoutWallet = payable(init.payoutWallet == address(0) ? init.owner : init.payoutWallet);
        _nextTokenId = 1;
        _baseTokenURI = init.baseURI;
        _setMintConfig(init.mintConfig);
    }

    function mint(uint256 amount) external payable virtual nonReentrant {
        _collectPayment(_msgSender(), amount, msg.value);
        _mintTokens(_msgSender(), amount);
    }

    function setMintConfig(MintConfig memory config) external onlyOwner {
        _setMintConfig(config);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function setPayoutWallet(address newWallet) external onlyOwner {
        if (newWallet == address(0)) revert InvalidWallet();
        payoutWallet = payable(newWallet);
        emit PayoutWalletUpdated(newWallet);
    }

    function remainingSupply() external view returns (uint256) {
        return maxSupply - totalMinted;
    }

    function _setMintConfig(MintConfig memory config) internal {
        if (config.saleEnd != 0 && config.saleEnd <= config.saleStart) revert InvalidConfig();
        mintPrice = config.price;
        walletLimit = config.walletLimit;
        saleStart = config.saleStart;
        saleEnd = config.saleEnd;
        emit MintConfigUpdated(config);
    }

    function _mintTokens(address buyer, uint256 amount) internal {
        if (amount == 0) revert InvalidConfig();
        if (block.timestamp < saleStart) revert SaleNotStarted();
        if (saleEnd != 0 && block.timestamp > saleEnd) revert SaleEnded();
        if (totalMinted + amount > maxSupply) revert SoldOut();

        if (walletLimit != 0) {
            uint256 newCount = mintedPerWallet[buyer] + amount;
            if (newCount > walletLimit) revert WalletLimitReached();
            mintedPerWallet[buyer] = newCount;
        } else {
            mintedPerWallet[buyer] += amount;
        }

        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _nextTokenId++;
            totalMinted += 1;
            _safeMint(buyer, tokenId);
        }
    }

    function _collectPayment(address buyer, uint256 amount, uint256 msgValue) internal virtual;

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}

contract LaunchpadNFTUSDC is LaunchpadNFTBase {
    using SafeERC20 for IERC20;

    error UnexpectedEth();

    IERC20 public immutable paymentToken;

    constructor(NFTInitConfig memory init, IERC20 paymentToken_) LaunchpadNFTBase(init) {
        paymentToken = paymentToken_;
    }

    function withdrawRaised(uint256 amount) external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        uint256 amountToSend = amount == 0 ? balance : amount;
        require(amountToSend <= balance, "insufficient funds");
        paymentToken.safeTransfer(payoutWallet, amountToSend);
    }

    function _collectPayment(address buyer, uint256 amount, uint256 msgValue) internal override {
        if (msgValue != 0) revert UnexpectedEth();
        uint256 cost = uint256(mintPrice) * amount;
        if (cost > 0) {
            paymentToken.safeTransferFrom(buyer, address(this), cost);
        }
    }
}

contract LaunchpadNFTEth is LaunchpadNFTBase {
    error IncorrectPayment();

    constructor(NFTInitConfig memory init) LaunchpadNFTBase(init) {}

    function withdrawRaised(uint256 amount) external onlyOwner {
        uint256 balance = address(this).balance;
        uint256 amountToSend = amount == 0 ? balance : amount;
        require(amountToSend <= balance, "insufficient funds");
        (bool ok,) = payoutWallet.call{value: amountToSend}("");
        require(ok, "transfer failed");
    }

    function _collectPayment(address, uint256 amount, uint256 msgValue) internal override {
        uint256 cost = uint256(mintPrice) * amount;
        if (msgValue != cost) revert IncorrectPayment();
    }
}
