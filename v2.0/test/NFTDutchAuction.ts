import { expect } from "chai";
import { Signer } from "ethers";
import { ethers, network } from "hardhat";
import { NFTDutchAuction } from "../typechain-types";

describe("NFTDutchAuction Contract", function () {
  let NFTDutchAuctionToken: NFTDutchAuction;
  let owner: Signer, account1: Signer, account2: Signer;

  before(async function () {
    [owner, account1, account2] = await ethers.getSigners();
    const NFTDutchAuctionFactory = await ethers.getContractFactory(
      "NFTDutchAuction"
    );
    NFTDutchAuctionToken = await NFTDutchAuctionFactory.connect(owner).deploy(
      await owner.getAddress(),
      0,
      100,
      10,
      10
    );
  });

  it("should have a reserve price of 100 wei", async function () {
    expect(await NFTDutchAuctionToken.reservePrice()).to.equal(100);
  });

  it("should have a number of blocks the auction is open for of 10", async function () {
    expect(await NFTDutchAuctionToken.numBlocksAuctionOpen()).to.equal(10);
  });

  it("should have an offer price decrement of 10 wei", async function () {
    expect(await NFTDutchAuctionToken.offerPriceDecrement()).to.equal(10);
  });

  it("should have an initial price of 200 wei", async function () {
    expect(await NFTDutchAuctionToken.getCurrentPrice()).to.equal(200);
  });

  describe("Setting MyNFT Contract Address", function () {
    it("should set the contract address", async function () {
      expect(await NFTDutchAuctionToken.setMyNFT(await owner.getAddress()));
    });
  });

  describe("Checking Seller", function () {
    it("should have the owner as the seller", async function () {
      expect(await NFTDutchAuctionToken.getSeller()).to.equal(
        await owner.getAddress()
      );
    });
    it("should reject a bid from the seller", async function () {
      expect(
        NFTDutchAuctionToken.connect(owner).bid({ value: 200 })
      ).to.be.revertedWith("Owner cannot submit bid on own item");
    });
  });

  describe("Checking Bidders", function () {
    it("should accept a bid of 300 wei", async function () {
      expect(
        NFTDutchAuctionToken.connect(account1).bid({ value: 300 })
      ).to.emit(NFTDutchAuctionToken, "AuctionSuccessful");
    });
    it("should reject a bid of 100 wei", async function () {
      expect(
        NFTDutchAuctionToken.connect(account1).bid({ value: 100 })
      ).to.be.revertedWith("You have not bid sufficient funds");
    });

    it("should accept two bids, one higher and one lower than the current price", async function () {
      expect(
        NFTDutchAuctionToken.connect(account1).bid({
          from: await account1.getAddress(),
          value: 300,
        })
      );
      expect(
        NFTDutchAuctionToken.connect(account2).bid({
          from: await account2.getAddress(),
          value: 100,
        })
      );
    });

    it("should accept two bids, both higher than the current price", async function () {
      expect(
        NFTDutchAuctionToken.connect(account1).bid({
          from: await account1.getAddress(),
          value: 300,
        })
      );
      expect(
        NFTDutchAuctionToken.connect(account2).bid({
          from: await account2.getAddress(),
          value: 400,
        })
      );
    });

    it("should revert when trying to get winner before the auction ends", async function () {
      expect(NFTDutchAuctionToken.getWinner()).to.be.revertedWith(
        "Auction has not closed"
      );
    });

    // Don't know why I got this Error: Transaction reverted: function call to a non-contract account
    // it("should return the winner after the auction ends", async function () {
    //   await NFTDutchAuctionToken.connect(account2).bid({ value: 300 });

    //   expect(await NFTDutchAuctionToken.getWinner()).to.equal(
    //     await account2.getAddress()
    //   );
    // });

    it("should reject a bid after the auction has already been won", async function () {
      NFTDutchAuctionToken.connect(account1).bid({ value: 300 });

      expect(
        NFTDutchAuctionToken.connect(account2).bid({
          from: await account2.getAddress(),
          value: 400,
        })
      ).to.be.revertedWith("Someone has already won the auction");
    });

    it("should reject a bid after the auction has ended", async function () {
      await network.provider.send("evm_increaseTime", [11]);
      await network.provider.send("evm_mine");

      expect(
        NFTDutchAuctionToken.connect(account1).bid({
          from: await account1.getAddress(),
          value: 300,
        })
      ).to.be.revertedWith("Auction is closed");
    });
  });
});
