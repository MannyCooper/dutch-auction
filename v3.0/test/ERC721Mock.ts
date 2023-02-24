import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("ERC721Mock Contract", () => {
  let erc721NFT: Contract;
  let owner: any;
  let recipient: any;

  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();
    const ERC721Mock = await ethers.getContractFactory("ERC721Mock");
    erc721NFT = await ERC721Mock.deploy(10);
    await erc721NFT.deployed();
  });

  describe("deployment", () => {
    it("should set the max supply", async () => {
      expect(await erc721NFT.maxTokens()).to.equal(10);
    });
  });

  describe("mint", () => {
    const uri = "https://example.com/token/1";

    async function mintTokens(numTokens: number): Promise<void> {
      for (let i = 0; i < numTokens; i++) {
        await erc721NFT.mint(owner.address, uri);
      }
    }

    it("should mint a new NFT to the owner", async () => {
      await erc721NFT.mint(owner.address, uri);
      expect(await erc721NFT.balanceOf(owner.address)).to.equal(1);
    });

    it("should not mint more tokens than the max supply", async () => {
      await mintTokens(10);
      await expect(erc721NFT.mint(owner.address, uri)).to.be.revertedWith(
        "Max tokens minted"
      );
    });

    it("should transfer ownership of a token to a recipient", async () => {
      await erc721NFT.mint(owner.address, uri);
      const tokenId = 0;
      await erc721NFT.transferFrom(owner.address, recipient.address, tokenId);
      expect(await erc721NFT.ownerOf(tokenId)).to.equal(recipient.address);
    });
  });
});
