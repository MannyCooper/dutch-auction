// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/UniswapV2Factory.sol";

contract MockToken {
    function transfer() public pure returns (bool) {
        return true;
    }
}

contract UniswapV2FactoryTest is Test {
    UniswapV2Factory factory;
    MockToken tokenA;
    MockToken tokenB;

    function setUp() public {
        factory = new UniswapV2Factory(address(this));
        tokenA = new MockToken();
        tokenB = new MockToken();
    }

    function test_createPair() public {
        address pair = factory.createPair(address(tokenA), address(tokenB));
        assertTrue(pair != address(0));
        assertTrue(factory.getPair(address(tokenA), address(tokenB)) == pair);
    }

    function test_createPair_withIdenticalAddresses() public {
        try factory.createPair(address(tokenA), address(tokenA)) {
            assertTrue(
                false,
                "Pair should not be created with identical addresses"
            );
        } catch Error(string memory reason) {
            assertEq(reason, "UniswapV2: IDENTICAL_ADDRESSES");
        }
    }

    function test_createPair_withZeroAddress() public {
        try factory.createPair(address(tokenA), address(0)) {
            assertTrue(false, "Pair should not be created with zero address");
        } catch Error(string memory reason) {
            assertEq(reason, "UniswapV2: ZERO_ADDRESS");
        }
    }

    function test_createPair_withExistingPair() public {
        factory.createPair(address(tokenA), address(tokenB));
        try factory.createPair(address(tokenA), address(tokenB)) {
            assertTrue(false, "Pair should not be created again");
        } catch Error(string memory reason) {
            assertEq(reason, "UniswapV2: PAIR_EXISTS");
        }
    }

    function test_setFeeTo() public {
        address newFeeTo = address(new MockToken());
        factory.setFeeTo(newFeeTo);
        assertEq(factory.feeTo(), newFeeTo);
    }

    function testFail_setFeeTo_byNonFeeToSetter() public {
        UniswapV2Factory other = new UniswapV2Factory(address(this));
        vm.expectRevert("UniswapV2: FORBIDDEN");
        other.setFeeTo(address(this));
    }

    function test_setFeeToSetter() public {
        address newFeeToSetter = address(new MockToken());
        factory.setFeeToSetter(newFeeToSetter);
        assertEq(factory.feeToSetter(), newFeeToSetter);
    }

    function testFail_setFeeToSetter_byNonFeeToSetter() public {
        UniswapV2Factory other = new UniswapV2Factory(address(this));
        vm.expectRevert("UniswapV2: FORBIDDEN");
        other.setFeeToSetter(address(this));
    }
}
