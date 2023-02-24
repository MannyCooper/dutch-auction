import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20Mock", function () {
  let ERC20: any;
  let erc20: any;

  beforeEach(async function () {
    ERC20 = await ethers.getContractFactory("ERC20Mock");
    erc20 = await ERC20.deploy("MockToken", "MT");
    await erc20.deployed();
  });

  it("should have correct name, symbol and decimals", async function () {
    expect(await erc20.name()).to.equal("MockToken");
    expect(await erc20.symbol()).to.equal("MT");
    expect(await erc20.decimals()).to.equal(18);
  });

  it("should mint tokens", async function () {
    const amount = 100;
    await erc20.mint(amount);
    expect(
      await erc20.balanceOf(await ethers.provider.getSigner(0).getAddress())
    ).to.equal(amount);
    expect(await erc20.totalSupply()).to.equal(amount);
  });

  it("should burn tokens", async function () {
    const amount = 100;
    await erc20.mint(amount);
    await erc20.burn(amount);
    expect(
      await erc20.balanceOf(await ethers.provider.getSigner(0).getAddress())
    ).to.equal(0);
    expect(await erc20.totalSupply()).to.equal(0);
  });

  it("should transfer tokens", async function () {
    const amount = 100;
    await erc20.mint(amount);
    const recipient = ethers.utils.getAddress(
      "0x0000000000000000000000000000000000000001"
    );
    await erc20.transfer(recipient, amount);
    expect(
      await erc20.balanceOf(await ethers.provider.getSigner(0).getAddress())
    ).to.equal(0);
    expect(await erc20.balanceOf(recipient)).to.equal(amount);
  });

  it("should approve and transferFrom tokens", async function () {
    const alice = ethers.provider.getSigner(0);
    const bob = ethers.provider.getSigner(1);

    const amount = 100;
    await erc20.mint(amount);

    await erc20.approve(bob.getAddress(), amount);

    await erc20
      .connect(bob)
      .transferFrom(alice.getAddress(), bob.getAddress(), amount);

    expect(await erc20.balanceOf(alice.getAddress())).to.equal(0);

    expect(await erc20.balanceOf(bob.getAddress())).to.equal(amount);
  });
});
