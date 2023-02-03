// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 1. The seller instantiates a DutchAuction contract to manage the auction of a single, physical item at a single auction event.
// The contract is initialized with the following parameters:
// a. reservePrice: the minimum amount of wei that the seller is willing to accept for the item
// b. numBlocksAuctionOpen: the number of blockchain blocks that the auction is open for
// c. offerPriceDecrement: the amount of wei that the auction price should decrease by during each subsequent
// block.
// 2. The seller is the owner of the contract.
// 3. The auction begins at the block in which the contract is created.
// 4. The initial price of the item is derived from reservePrice, numBlocksAuctionOpen, and offerPriceDecrement: initialPrice
// = reservePrice + numBlocksAuctionOpen*offerPriceDecrement
// 5. A bid can be submitted by any Ethereum externally-owned account.
// 6. The first bid processed by the contract that sends wei greater than or equal to the current price is the winner. The wei should be transferred immediately to the seller and the contract should not accept any more bids. All bids besides the winning bid should be refunded immediately.

contract BasicDutchAuction {
    uint256 private reservePrice;
    uint256 private numBlocksAuctionOpen;
    uint256 private offerPriceDecrement;

    uint256 public initialPrice;

    address public seller;
    address public buyer;
    address private owner;
    address public winner;

    uint256 private initialBlock;
    bool public auctionEnded;

    constructor(uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) {
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;

        initialPrice = reservePrice + numBlocksAuctionOpen * offerPriceDecrement;

        owner = payable(msg.sender);
        seller = owner;

        initialBlock = block.number;
    }

   function currentBlock() view private returns(uint256){
        return block.number;
    }

    function blockDifference() view private returns(uint256){
        return currentBlock() - initialBlock;
    }
    function currentPrice() public view returns(uint256) {
        return initialPrice - blockDifference() * offerPriceDecrement;
    }

    function bid() public payable returns(address) {
        require(!auctionEnded && numBlocksAuctionOpen >= blockDifference(), "Auction has already ended.");
        require(msg.value >= currentPrice(), "Bid value must be greater than or equal to the current price.");

        buyer = msg.sender;
        payable(seller).transfer(msg.value);
        winner = buyer;
        owner = winner;
        auctionEnded = true;
        return owner;
    }

    function finalize() public view {
        // require(auctionEnded, "Auction has not ended yet.");
    }

    function refund(uint256 refundAmount) public {
        // require(auctionEnded, "Auction has not ended yet.");
        // require(msg.sender != winner, "Winner cannot request a refund.");

        // payable(msg.sender).transfer(refundAmount);
    }
}