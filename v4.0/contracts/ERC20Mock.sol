// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20Mock is IERC20 {
    mapping(address => uint256) public override balanceOf;

    mapping(address => mapping(address => uint256)) public override allowance;

    uint256 public override totalSupply;

    string public name;
    string public symbol;

    uint8 public decimals = 18;

    constructor(string memory name_, string memory symbol_) {
        name = name_;
        symbol = symbol_;
    }

    function transfer(
        address recipient,
        uint amount
    ) external override returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(
        address spender,
        uint amount
    ) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external override returns (bool) {
        require(
            allowance[sender][msg.sender] >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        require(
            balanceOf[sender] >= amount,
            "ERC20: transfer amount exceeds balance"
        );

        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        require(
            balanceOf[msg.sender] >= amount,
            "ERC20: burn amount exceeds balance"
        );

        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}
