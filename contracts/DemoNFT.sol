// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IRandomHbbft.sol";

contract DemoNFT is ERC721 {

    uint256 private _currentTokenId = 0;//Token ID here will start from 1

    // salt value that is used uniquely for salting the rng for each minted nft.
    uint256 private _current_minting_registry_salt = 1;

    uint256 public minting_fee = 1 ether;

    // a minting registry holds the information about upcomming minting of nfts.
    // one account can only mint one NFT at a time.
    // minting can only be done after registering the minting
    // minting registry is cleared after the minting is done.
    mapping(address => uint256) public _minting_registry_blocks;

    // the salt is connected to _minting_registry_blocks and prevents manipulation of the rng
    mapping(address => uint256) public _minting_registry_salts;

    // modifier onlyEOA() {
    //     require(msg.sender == tx.origin, "TestNFT: must use EOA");
    //     _;
    // }

    IRandomHbbft private _random_hbbft;

    constructor(random_hbbft_address) ERC721("TestNFT", "TST") {
        _random_hbbft = IRandomHbbft(random_hbbft_address);
    }
    ERC721("DemoNFT", "DEMO") {
    }

    function register_minting() public payable {

        // if there is already a minting registered for the sender, then the minting is not allowed.
        require(_minting_registry_blocks[msg.sender] == 0, "TestNFT: minting already registered");

        // the minting fee has to be paid for registering the minting.
        require(msg.value >= minting_fee, "TestNFT: not enough ether sent");

        // the minting can only happen in the future,
        // all mining fees have to be paid during the registration.
        _minting_registry_blocks[msg.sender] = block.number + 1;
        _minting_registry_salts[msg.sender] = _current_minting_registry_salt;
        _current_minting_registry_salt++;
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to) public {

        // if there is no minting registered for the sender, then the minting is not allowed.
        require(_minting_registry_blocks[msg.sender] != 0, "TestNFT: minting not registered");

        uint256 newTokenId = _getNextTokenId();
        _safeMint(_to, newTokenId);

        uint256 block_number = _minting_registry_blocks[msg.sender];
        uint256 salt = _minting_registry_salts[msg.sender];
        
        _incrementTokenId();

        // clear the minting registry for this sender.
        _minting_registry_blocks[msg.sender] = 0;
        _minting_registry_salts[msg.sender] = 0;

    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId+1;
    }

    /**
     * @dev increments the value of _currentTokenId
     */
    function _incrementTokenId() private {
        _currentTokenId++;
    }
}