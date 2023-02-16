// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IMyNFT is IERC721 {
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function ownerOf(uint256 _tokenId) external view returns (address);

    function balanceOf(address _owner) external view returns (uint256);
}

contract NFTDutchAuction is Initializable {
    using SafeMath for uint256;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    address public seller;
    address public winner;
    uint256 public blockStart;
    uint256 public totalBids;
    bool public isAuctionOpen = true;
    uint256 public refundAmount;
    uint256 public nftTokenId;
    IMyNFT public myNFT;

    constructor(
        address erc721TokenAddress,
        uint256 _nftTokenId,
        uint256 _reservePrice,
        uint256 _numBlocksAuctionOpen,
        uint256 _offerPriceDecrement
    ) {
        require(
            _offerPriceDecrement > 0,
            "Offer price decrement must be greater than 0"
        );
        require(_reservePrice > 0, "Reserve price must be greater than 0");
        require(
            _numBlocksAuctionOpen > 0,
            "Number of blocks auction open must be greater than 0"
        );

        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        initialPrice = reservePrice.add(
            numBlocksAuctionOpen.mul(offerPriceDecrement)
        );
        seller = msg.sender;
        blockStart = block.number;
        nftTokenId = _nftTokenId;
        myNFT = IMyNFT(erc721TokenAddress);
    }

    function bid() public payable returns (address) {
        require(
            isAuctionOpen ||
                block.number.sub(blockStart) <= numBlocksAuctionOpen,
            "Auction is closed"
        );
        require(winner == address(0), "Someone has already won the auction");
        require(msg.sender != seller, "Owner cannot submit bid on own item");
        require(
            msg.value >= getCurrentPrice(),
            "You have not bid sufficient funds"
        );
        require(nftTokenId >= 0, "The NFT token ID is less than 0");
        isAuctionOpen = false;
        totalBids = totalBids.add(1);
        winner = msg.sender;
        payable(seller).transfer(msg.value);
        myNFT.safeTransferFrom(payable(seller), winner, nftTokenId);

        return winner;
    }

    function setMyNFT(IMyNFT _myNFT) public {
        myNFT = _myNFT;
    }

    function getCurrentPrice() public view returns (uint256) {
        return
            initialPrice.sub(
                (block.number.sub(blockStart)).mul(offerPriceDecrement)
            );
    }

    function getSeller() public view returns (address) {
        return seller;
    }

    function getWinner() public view returns (address) {
        require(!isAuctionOpen, "Auction has not closed");
        return winner;
    }
}
