// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ERC721Mock is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    uint256 public maxTokens;
    Counters.Counter private _tokenIdCounter;

    constructor(uint256 _maxTokens) ERC721("ERC20Mock", "ERC20") {
        require(
            _maxTokens > 0 && _maxTokens <= 500,
            "Max tokens must be between 1 and 500"
        );
        maxTokens = _maxTokens;
    }

    function mint(address _to, string memory _tokenURI) public onlyOwner {
        require(_tokenIdCounter.current() < maxTokens, "Max tokens minted");
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _tokenIdCounter.increment();
    }

    function burn(uint256 _tokenId) public onlyOwner {
        _burn(_tokenId);
    }
}
