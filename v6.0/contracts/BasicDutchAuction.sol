// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract BasicDutchAuction {
    uint256 public reservePrice;
    uint256 public numBlocksActionOpen;
    uint256 public offerPriceDecrement;

    uint256 public initialPrice;
    uint256 public currentPrice;

    address payable public seller;
    address payable public winner;

    uint256 public auctionEndBlock;
    uint256 private initialBlock;

    uint256 public winningBidAmount;
    bool public auctionEnded;

    constructor(
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        reservePrice = _reservePrice;
        numBlocksActionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        initialPrice = reservePrice + offerPriceDecrement * numBlocksActionOpen;
        currentPrice = initialPrice;

        seller = payable(msg.sender);

        initialBlock = block.number;
        auctionEndBlock = block.number + numBlocksActionOpen;

        auctionEnded = false;
    }

    function bid() public payable returns (address) {
        if (auctionEnded && winner != address(0) && msg.sender != winner) {
            address payable refundCaller = payable(msg.sender);
            refundCaller.transfer(address(this).balance);
        }
        require(!auctionEnded, "Auction has already ended.");
        require(block.number < auctionEndBlock, "Auction has already ended.");
        updatePrice();
        require(
            msg.value >= currentPrice,
            "Bid value must be greater than or equal to the current price."
        );
        require(winner == address(0), "Auction has already been won");

        winner = payable(msg.sender);
        seller.transfer(msg.value);
        winningBidAmount = msg.value;
        auctionEnded = true;
        return winner;
    }

    function currentBlock() private view returns (uint256) {
        return block.number;
    }

    function blockDifference() private view returns (uint256) {
        return currentBlock() - initialBlock;
    }

    function updatePrice() internal {
        if (block.number >= auctionEndBlock) {
            auctionEnded = true;
            return;
        }
        currentPrice = initialPrice - offerPriceDecrement * blockDifference();
    }

    function getInfo() public {
        updatePrice();
    }
}
