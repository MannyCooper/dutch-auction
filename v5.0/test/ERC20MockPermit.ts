import { expect } from "chai";
import { AbiCoder, defaultAbiCoder } from "ethers/lib/utils";
import { ecsign } from "ethereumjs-util";
import { ethers } from "hardhat";

describe("ERC20MockPermit", function () {
  let ERC20: any;
  let erc20: any;
  let owner: any;
  let spender: any;

  beforeEach(async function () {
    ERC20 = await ethers.getContractFactory("ERC20MockPermit");
    [owner, spender] = await ethers.getSigners();
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
    expect(await erc20.balanceOf(await owner.getAddress())).to.equal(amount);
    expect(await erc20.totalSupply()).to.equal(amount);
  });

  it("should burn tokens", async function () {
    const amount = 100;
    await erc20.mint(amount);
    await erc20.burn(amount);
    expect(await erc20.balanceOf(await owner.getAddress())).to.equal(0);
    expect(await erc20.totalSupply()).to.equal(0);
  });

  it("should transfer tokens", async function () {
    const amount = 100;
    await erc20.mint(amount);
    const recipient = ethers.utils.getAddress(
      "0x0000000000000000000000000000000000000001"
    );
    await erc20.transfer(recipient, amount);
    expect(await erc20.balanceOf(await owner.getAddress())).to.equal(0);
    expect(await erc20.balanceOf(recipient)).to.equal(amount);
  });

  it("should approve and transferFrom tokens", async function () {
    const alice = owner;
    const bob = spender;

    const amount = 100;
    await erc20.mint(amount);

    await erc20.approve(bob.getAddress(), amount);

    await erc20
      .connect(bob)
      .transferFrom(alice.getAddress(), bob.getAddress(), amount);

    expect(await erc20.balanceOf(alice.getAddress())).to.equal(0);
    expect(await erc20.balanceOf(bob.getAddress())).to.equal(amount);
  });

  it("should permit tokens", async function () {
    const name = "MockToken";
    const version = "1";
    const nonce = 0;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
    const value = ethers.utils.parseUnits("100", "ether");

    const domain = {
      name,
      version,
      chainId: await owner.getChainId(),
      verifyingContract: erc20.address,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const message = {
      owner: owner.address,
      spender: spender.address,
      value,
      nonce,
      deadline,
    };

    const signature = await owner._signTypedData(domain, types, message);
    const sig = ethers.utils.splitSignature(signature);

    await erc20.permit(
      owner.address,
      spender.address,
      value,
      deadline,
      sig.v,
      sig.r,
      sig.s
    );

    expect(await erc20.allowance(owner.address, spender.address)).to.equal(
      value
    );
  });
});
