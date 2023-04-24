// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/UniswapV2Factory.sol";
import "../src/ERC20Mock.sol";

contract UniswapV2FactoryTest is Test {
    UniswapV2Factory factory;
    ERC20Mock token0;
    ERC20Mock token1;

    function test() public {}

    function setUp() public {
        factory = new UniswapV2Factory(address(this));

        token0 = new ERC20Mock("Token0", "T0");
        token1 = new ERC20Mock("Token1", "T1");
    }

    function test_allPairsLength() public {
        assertEq(factory.allPairsLength(), 0);
    }

    function test_createPair() public {
        address pair = factory.createPair(address(token0), address(token1));
        assertTrue(pair != address(0));
        assertTrue(factory.getPair(address(token0), address(token1)) == pair);
    }

    function test_createPair_withIdenticalAddresses() public {
        try factory.createPair(address(token0), address(token0)) {
            assertTrue(
                false,
                "Pair should not be created with identical addresses"
            );
        } catch Error(string memory reason) {
            assertEq(reason, "UniswapV2: IDENTICAL_ADDRESSES");
        }
    }

    function test_createPair_withZeroAddress() public {
        try factory.createPair(address(token0), address(0)) {
            assertTrue(false, "Pair should not be created with zero address");
        } catch Error(string memory reason) {
            assertEq(reason, "UniswapV2: ZERO_ADDRESS");
        }
    }

    function test_createPair_withExistingPair() public {
        factory.createPair(address(token0), address(token1));
        try factory.createPair(address(token0), address(token1)) {
            assertTrue(false, "Pair should not be created again");
        } catch Error(string memory reason) {
            assertEq(reason, "UniswapV2: PAIR_EXISTS");
        }
    }

    function test_setFeeTo() public {
        address newFeeTo = address(new ERC20Mock("New Fee To", "NFT"));
        factory.setFeeTo(newFeeTo);
        assertEq(factory.feeTo(), newFeeTo);
    }

    function testFail_setFeeTo_byNonFeeToSetter() public {
        UniswapV2Factory other = new UniswapV2Factory(address(this));
        vm.expectRevert("UniswapV2: FORBIDDEN");
        other.setFeeTo(address(this));
    }

    function test_setFeeToSetter() public {
        address newFeeToSetter = address(
            new ERC20Mock("New Fee To Setter", "NFTS")
        );
        factory.setFeeToSetter(newFeeToSetter);
        assertEq(factory.feeToSetter(), newFeeToSetter);
    }

    function testFail_setFeeToSetter_byNonFeeToSetter() public {
        UniswapV2Factory other = new UniswapV2Factory(address(this));
        vm.expectRevert("UniswapV2: FORBIDDEN");
        other.setFeeToSetter(address(this));
    }
}
