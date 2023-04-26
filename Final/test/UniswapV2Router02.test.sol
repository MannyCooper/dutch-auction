// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ERC20Mock.sol";
import "../src/UniswapV2Router02.sol";
import "../src/UniswapV2Factory.sol";

contract UniswapV2RouterTest is Test {
    CheatCodes cheats = CheatCodes(HEVM_ADDRESS);
    UniswapV2Router02 private router;
    UniswapV2Factory private factory;
    address private pair;
    address private pairETH;
    UniswapV2ERC20 tokenA;
    UniswapV2ERC20 tokenB;
    UniswapV2ERC20 weth;

    function setUp() public {
        tokenA = new UniswapV2ERC20();
        tokenB = new UniswapV2ERC20();

        weth = new UniswapV2ERC20();

        factory = new UniswapV2Factory(address(0x01));
        router = new UniswapV2Router02(address(factory), address(weth));
        pair = factory.createPair(address(tokenA), address(tokenB));
        pairETH = factory.createPair(address(tokenA), address(weth));
    }

    function test_addLiquidity() public {
        tokenA._mint(address(pair), 2000);
        tokenB._mint(address(pair), 2000);

        tokenA._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        tokenA.approve(address(router), 1000);

        tokenB._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        tokenB.approve(address(router), 1000);

        uint256 amountADesired = 1000;
        uint256 amountBDesired = 1000;
        uint256 amountAMin = 0;
        uint256 amountBMin = 0;
        uint256 deadline = block.timestamp + 3600;
        cheats.prank(address(0x10));
        (uint256 amountA1, uint256 amountB1, uint256 liquidity) = router
            .addLiquidity(
                address(tokenA),
                address(tokenB),
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                address(0x10),
                deadline
            );

        assert(amountA1 == 1000);
        assert(amountB1 == 1000);
        assert(liquidity == 2000);
    }

    function test_removeLiquidity() public {
        tokenA._mint(address(pair), 2000);
        tokenB._mint(address(pair), 2000);

        tokenA._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        tokenA.approve(address(router), 1000);

        tokenB._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        tokenB.approve(address(router), 1000);

        uint256 amountADesired = 1000;
        uint256 amountBDesired = 1000;
        uint256 amountAMin = 0;
        uint256 amountBMin = 0;
        uint256 deadline = block.timestamp + 3600;
        cheats.prank(address(0x10));
        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            address(0x10),
            deadline
        );

        uint256 liquidityActual = 1000;
        cheats.prank(address(0x10));
        IUniswapV2Pair(pair).approve(address(router), liquidityActual);
        cheats.prank(address(0x10));
        (uint256 amountA2, uint256 amountB2) = router.removeLiquidity(
            address(tokenA),
            address(tokenB),
            liquidityActual,
            amountAMin,
            amountBMin,
            address(0x10),
            deadline
        );

        assert(amountA2 == 1000);
        assert(amountB2 == 1000);
    }

    function test_addLiquidityETH() public {
        tokenA._mint(address(pairETH), 2000);
        weth._mint(address(pairETH), 2000);

        tokenA._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        tokenA.approve(address(router), 1000);

        weth._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        weth.approve(address(router), 1000);

        uint256 amountTokenDesired = 1000;
        uint256 amountTokenMin = 0;
        uint256 amountETHMin = 0;
        uint256 deadline = block.timestamp + 3600;

        cheats.prank(address(0x10));
        (uint256 amountToken1, uint256 amountETH1, uint256 liquidity) = router
            .addLiquidityETH(
                address(tokenA),
                amountTokenDesired,
                amountTokenMin,
                1000,
                amountETHMin,
                address(0x10),
                deadline
            );

        assert(amountToken1 == 1000);
        assert(amountETH1 == 1000);
        assert(liquidity == 2000);
    }

    function test_removeLiquidityETH() public {
        tokenA._mint(address(pairETH), 2000);
        weth._mint(address(pairETH), 2000);

        tokenA._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        tokenA.approve(address(router), 1000);

        weth._mint(address(0x10), 1000);
        cheats.prank(address(0x10));
        weth.approve(address(router), 1000);

        uint256 amountTokenDesired = 1000;
        uint256 amountTokenMin = 0;
        uint256 amountETHMin = 0;
        uint256 deadline = block.timestamp + 3600;

        cheats.prank(address(0x10));
        router.addLiquidityETH(
            address(tokenA),
            amountTokenDesired,
            amountTokenMin,
            1000,
            amountETHMin,
            address(0x10),
            deadline
        );

        uint256 liquidityActual = 1000;
        cheats.prank(address(0x10));
        IUniswapV2Pair(pairETH).approve(address(router), liquidityActual);
        cheats.prank(address(0x10));
        (uint256 amountToken2, uint256 amountETH2) = router.removeLiquidityETH(
            address(tokenA),
            liquidityActual,
            amountTokenMin,
            amountETHMin,
            address(0x10),
            deadline
        );

        assert(amountToken2 == 1000);
        assert(amountETH2 == 1000);
    }
}

interface CheatCodes {
    function prank(address) external;
}
