// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ERC20Mock.sol";
import "../src/UniswapV2Pair.sol";
import "../src/UniswapV2Factory.sol";

contract UniswapV2PairTest is Test {
    UniswapV2Pair pair;
    ERC20Mock token0;
    ERC20Mock token1;

    function test() public {}

    function setUp() public {
        token0 = new ERC20Mock("Token0", "T0");
        token1 = new ERC20Mock("Token1", "T1");

        UniswapV2Factory factory = new UniswapV2Factory(address(this));
        factory.setFeeTo(address(this));
        address pairAddress = factory.createPair(
            address(token0),
            address(token1)
        );
        pair = UniswapV2Pair(pairAddress);

        token0.mint(10 ether, address(this));
        token1.mint(10 ether, address(this));

        token0.approve(address(pair), type(uint256).max);
        token1.approve(address(pair), type(uint256).max);
    }

    function test_getReserves() external {
        (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = pair
            .getReserves();
        assertEq(reserve0, 0);
        assertEq(reserve1, 0);
        assertEq(blockTimestampLast, 0);
    }

    function test_mint() external {
        token0.transfer(address(pair), 1 ether);
        token1.transfer(address(pair), 1 ether);
        pair.mint(address(this));

        assertEq(pair.balanceOf(address(this)), 1 ether - 1000);
        assertReserves(1 ether, 1 ether);
        assertEq(pair.totalSupply(), 1 ether);
    }

    function test_swap() public {
        token0.transfer(address(pair), 5 ether);
        token1.transfer(address(pair), 10 ether);
        pair.mint(address(this));

        uint256 amountOut = 0.181322178776029826 ether;
        token0.transfer(address(pair), 1 ether);

        pair.swap(0, amountOut, address(this), "");

        assertEq(
            token0.balanceOf(address(this)),
            10 ether - 5 ether - 1 ether + amountOut,
            "unexpected token0 balance"
        );
        assertEq(
            token1.balanceOf(address(this)),
            10 ether - 10 ether,
            "unexpected token1 balance"
        );

        assertReserves(10 ether, uint112(5 ether - amountOut + 1 ether));
    }

    function test_swapZeroOut() public {
        token0.transfer(address(pair), 1 ether);
        token1.transfer(address(pair), 2 ether);
        pair.mint(address(this));

        vm.expectRevert("UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT");
        pair.swap(0, 0, address(this), "");
    }

    function test_burn() external {
        token0.transfer(address(pair), 1 ether);
        token1.transfer(address(pair), 1 ether);

        pair.mint(address(this));

        uint256 liquidity = pair.balanceOf(address(this));
        pair.transfer(address(pair), liquidity);
        pair.burn(address(this));

        assertEq(pair.balanceOf(address(this)), 0);
        assertReserves(1000, 1000);
        assertEq(pair.totalSupply(), 1000);
        assertEq(token0.balanceOf(address(this)), 10 ether - 1000);
        assertEq(token1.balanceOf(address(this)), 10 ether - 1000);
    }

    function test_skim() public {
        token0.transfer(address(pair), 1 ether);
        token1.transfer(address(pair), 1 ether);

        pair.mint(address(this)); // + 1 LP

        vm.warp(37);

        token0.transfer(address(pair), 2 ether);
        token1.transfer(address(pair), 2 ether);

        pair.mint(address(this)); // + 2 LP

        assertEq(pair.balanceOf(address(this)), 3 ether - 1000);
        assertEq(pair.totalSupply(), 3 ether);
        assertReserves(3 ether, 3 ether);

        pair.skim(address(this));

        assertEq(pair.totalSupply(), 3 ether);
        assertReserves(3 ether, 3 ether);
    }

    function test_sync() public {
        pair.sync();
    }

    function assertReserves(
        uint112 expectedReserve0,
        uint112 expectedReserve1
    ) internal {
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();
        assertEq(reserve0, expectedReserve0, "unexpected reserve0");
        assertEq(reserve1, expectedReserve1, "unexpected reserve1");
    }
}
