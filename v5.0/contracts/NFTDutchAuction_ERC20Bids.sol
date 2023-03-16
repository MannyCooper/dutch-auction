// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NFTDutchAuction_ERC20Bids is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    using SafeMathUpgradeable for uint256;

    address public seller;
    address public erc20Address;
    address public erc721Address;
    uint256 public nftTokenId;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    uint256 public auctionStartTime;
    bool public ended;
    uint256 public highestBid;
    address public highestBidder;
    mapping(address => uint256) public balances;

    event Bid(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount);

    function initialize(
        address erc20TokenAddress,
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) public initializer {
        require(
            _numBlocksAuctionOpen < 10 ** 18,
            "numBlocksAuctionOpen too large"
        );
        seller = msg.sender;
        erc20Address = erc20TokenAddress;
        erc721Address = erc721TokenAddress;
        nftTokenId = _nftTokenId;
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        initialPrice = reservePrice.add(
            numBlocksAuctionOpen.mul(offerPriceDecrement)
        );
        auctionStartTime = block.timestamp;
        ended = false;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function bid(uint256 _amount) public {
        require(!ended, "Auction has already ended");
        require(
            block.timestamp <
                auctionStartTime.add(numBlocksAuctionOpen.mul(15)),
            "Auction has expired"
        );
        require(
            IERC20Upgradeable(erc20Address).balanceOf(msg.sender) >= _amount,
            "Insufficient balance"
        );
        require(
            IERC20Upgradeable(erc20Address).allowance(
                msg.sender,
                address(this)
            ) >= _amount,
            "Token allowance not set"
        );

        if (highestBidder != address(0)) {
            uint256 refundAmount = balances[highestBidder];
            if (refundAmount > 0) {
                balances[highestBidder] = 0;
                IERC20Upgradeable(erc20Address).transfer(
                    highestBidder,
                    refundAmount
                );
            }
        }

        uint256 currentPrice = getCurrentPrice();
        require(_amount >= currentPrice, "Bid amount is too low");

        highestBid = _amount;
        highestBidder = msg.sender;
        balances[highestBidder] = highestBid;

        emit Bid(highestBidder, highestBid);
    }

    function endAuction() public {
        require(!ended, "Auction has already ended");
        require(msg.sender == seller, "Only the seller can end the auction");

        ended = true;
        // IERC20Upgradeable(erc20Address).transfer(seller, highestBid);
        // IERC721Upgradeable(erc721Address).safeTransferFrom(
        //     address(this),
        //     highestBidder,
        //     nftTokenId
        // );

        emit AuctionEnded(highestBidder, highestBid);
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 elapsedBlocks = block.number.sub(block.number);
        uint256 currentPrice = initialPrice.sub(
            elapsedBlocks.mul(offerPriceDecrement)
        );
        return currentPrice;
    }

    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function getWinner() public view returns (address) {
        return highestBidder;
    }

    function getSeller() public view returns (address) {
        return seller;
    }
}
