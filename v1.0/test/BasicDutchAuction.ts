import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const reservePrice = 1000;
const priceDrop = 100;
const duration = 5;

describe("BasicDutchAuction", function () {
  async function deployBasicDutchAuction() {
    const [seller, buyer] = await ethers.getSigners();

    const BasicDutchAuction = await ethers.getContractFactory(
      "BasicDutchAuction"
    );
    const basicDutchAuction = await BasicDutchAuction.deploy(
      reservePrice,
      priceDrop,
      duration
    );

    return { seller, buyer, basicDutchAuction };
  }

  describe("Deployment", function () {
    it("should set initialPrice correctly", async function () {
      const { basicDutchAuction } = await loadFixture(deployBasicDutchAuction);

      const initialPrice = await basicDutchAuction.initialPrice();

      expect(initialPrice).to.equal(reservePrice + priceDrop * duration);
    });

    it("should set seller correctly", async function () {
      const { seller, basicDutchAuction } = await deployBasicDutchAuction();

      const contractSeller = await basicDutchAuction.seller();

      expect(contractSeller).to.equal(seller.address);
    });

    it("should set auctionEnded to false", async function () {
      const { basicDutchAuction } = await loadFixture(deployBasicDutchAuction);

      const auctionEnded = await basicDutchAuction.auctionEnded();

      expect(auctionEnded).to.be.false;
    });
  });

  describe("Bid", function () {
    it("should set winner and auctionEnded correctly", async function () {
      const { buyer, basicDutchAuction } = await loadFixture(
        deployBasicDutchAuction
      );
      await basicDutchAuction.connect(buyer).bid({ value: 1500 });

      const winner = await basicDutchAuction.winner();
      const auctionEnded = await basicDutchAuction.auctionEnded();

      expect(winner).to.equal(buyer.address);
      expect(auctionEnded).to.be.true;
    });

    it("should reject if auction has already ended", async function () {
      const { basicDutchAuction } = await deployBasicDutchAuction();

      await basicDutchAuction.bid({ value: 1500 });

      let error;
      try {
        await basicDutchAuction.bid({ value: 2000 });
      } catch (e: any) {
        error = e;
      }
      expect(error.message).to.include("Auction has already ended.");
    });
    it("should reject if bid value is less than current price", async function () {
      const { basicDutchAuction } = await loadFixture(deployBasicDutchAuction);

      let error;
      try {
        await basicDutchAuction.bid({ value: 500 });
      } catch (e: any) {
        error = e;
      }

      expect(error.message).to.include(
        "Bid value must be greater than or equal to the current price."
      );
    });
  });
});
