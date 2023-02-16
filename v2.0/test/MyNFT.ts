import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("MyNFT Contract", () => {
  let myNFT: Contract;
  let owner: any;
  let recipient: any;

  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(10);
    await myNFT.deployed();
  });

  describe("deployment", () => {
    it("should set the max supply", async () => {
      expect(await myNFT.maxTokens()).to.equal(10);
    });
  });

  describe("mint", () => {
    const uri = "https://example.com/token/1";

    async function mintTokens(numTokens: number): Promise<void> {
      for (let i = 0; i < numTokens; i++) {
        await myNFT.mint(owner.address, uri);
      }
    }

    it("should mint a new NFT to the owner", async () => {
      await myNFT.mint(owner.address, uri);
      expect(await myNFT.balanceOf(owner.address)).to.equal(1);
    });

    it("should not mint more tokens than the max supply", async () => {
      await mintTokens(10);
      await expect(myNFT.mint(owner.address, uri)).to.be.revertedWith(
        "Max tokens minted"
      );
    });

    it("should transfer ownership of a token to a recipient", async () => {
      await myNFT.mint(owner.address, uri);
      const tokenId = 0;
      await myNFT.transferFrom(owner.address, recipient.address, tokenId);
      expect(await myNFT.ownerOf(tokenId)).to.equal(recipient.address);
    });
  });
});
