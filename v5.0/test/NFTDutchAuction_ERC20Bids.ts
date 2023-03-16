import { ERC721Mock } from "./../typechain-types/contracts/ERC721Mock";
import { expect } from "chai";
import { ethers, network, upgrades } from "hardhat";
import { ERC20MockPermit, NFTDutchAuction_ERC20Bids } from "../typechain-types";
import { Contract, Signer } from "ethers";

describe("NFTDutchAuction_ERC20Bids", function () {
  let NFTDutchAuction: Contract;
  let erc20Token: ERC20MockPermit;
  let erc721Token: ERC721Mock;
  let reservePrice: number;
  let numBlocksAuctionOpen: number;
  let offerPriceDecrement: number;
  let owner: Signer, account1: Signer, account2: Signer;

  beforeEach(async function () {
    [owner, account1, account2] = await ethers.getSigners();

    const ERC20MockPermit = await ethers.getContractFactory("ERC20MockPermit");
    erc20Token = await ERC20MockPermit.deploy("Token", "TKN");
    await erc20Token.deployed();

    const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
    erc721Token = await ERC721Mock.deploy(10);
    await erc721Token.deployed();

    const NFTDutchAuction_ERC20Bids = await ethers.getContractFactory(
      "NFTDutchAuction_ERC20Bids"
    );
    reservePrice = 100;
    numBlocksAuctionOpen = 10;
    offerPriceDecrement = 1;

    NFTDutchAuction = await upgrades.deployProxy(
      NFTDutchAuction_ERC20Bids,
      [
        erc20Token.address,
        erc721Token.address,
        1,
        reservePrice,
        numBlocksAuctionOpen,
        offerPriceDecrement,
      ],
      {
        kind: "uups",
        initializer:
          "initialize(address,address,uint256,uint256,uint256,uint256)",
      }
    );
    await NFTDutchAuction.deployed();
  });

  it("should have a reserve price of 100 wei", async function () {
    expect(await NFTDutchAuction.reservePrice()).to.equal(100);
  });

  it("should have a number of blocks the auction is open for of 10", async function () {
    expect(await NFTDutchAuction.numBlocksAuctionOpen()).to.equal(10);
  });

  it("should have an offer price decrement of 1 wei", async function () {
    expect(await NFTDutchAuction.offerPriceDecrement()).to.equal(1);
  });

  it("should have an initial price of 110 wei", async function () {
    expect(await NFTDutchAuction.getCurrentPrice()).to.equal(110);
  });

  describe("Checking Seller", function () {
    it("should have the owner as the seller", async function () {
      expect(await NFTDutchAuction.getSeller()).to.equal(
        await owner.getAddress()
      );
    });
    it("should reject a bid from the seller", async function () {
      expect(NFTDutchAuction.connect(owner).bid(200)).to.be.revertedWith(
        "Owner cannot submit bid on own item"
      );
    });
  });

  describe("Checking Bidders", function () {
    it("should accept a bid of 300 wei", async function () {
      expect(NFTDutchAuction.connect(account1).bid(300)).to.emit(
        NFTDutchAuction,
        "AuctionSuccessful"
      );
    });
    it("should reject a bid of 100 wei", async function () {
      expect(NFTDutchAuction.connect(account1).bid(100)).to.be.revertedWith(
        "You have not bid sufficient funds"
      );
    });

    it("should accept two bids, one higher and one lower than the current price", async function () {
      expect(NFTDutchAuction.connect(account1).bid(300));
      expect(NFTDutchAuction.connect(account2).bid(100));
    });

    it("should accept two bids, both higher than the current price", async function () {
      expect(NFTDutchAuction.connect(account1).bid(300));
      expect(NFTDutchAuction.connect(account2).bid(400));
    });

    it("should revert when trying to get winner before the auction ends", async function () {
      expect(NFTDutchAuction.getWinner()).to.be.revertedWith(
        "Auction has not closed"
      );
    });

    it("should return the winner after the auction ends", async function () {
      await erc20Token.connect(account1).mint(300);
      await erc20Token.connect(account1).approve(NFTDutchAuction.address, 300);
      await NFTDutchAuction.connect(account1).bid(200);

      await NFTDutchAuction.endAuction();

      const winner = await NFTDutchAuction.getWinner();
      expect(winner).to.equal(await account1.getAddress());
    });

    it("should reject a bid after the auction has already been won", async function () {
      NFTDutchAuction.connect(account1).bid(300);

      expect(NFTDutchAuction.connect(account2).bid(400)).to.be.revertedWith(
        "Someone has already won the auction"
      );
    });

    it("should reject a bid after the auction has ended", async function () {
      await network.provider.send("evm_increaseTime", [11]);
      await network.provider.send("evm_mine");

      expect(NFTDutchAuction.connect(account1).bid(300)).to.be.revertedWith(
        "Auction is closed"
      );
    });
  });
});
