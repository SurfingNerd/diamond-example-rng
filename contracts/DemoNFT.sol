// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IRandomHbbft.sol";

contract DemoNFT is ERC721 {
    uint256 private _currentTokenId = 0; //Token ID here will start from 1

    // salt value that is used uniquely for salting the rng for each minted nft.
    uint256 private _currentMintingRegistrySalt = 1;

    uint256 public mintingFee = 1 ether;

    // a minting registry holds the information about upcomming minting of nfts.
    // one account can only mint one NFT at a time.
    // minting can only be done after registering the minting
    // minting registry is cleared after the minting is done.
    mapping(address => uint256) public _minting_registry_blocks;

    // the salt is connected to _minting_registry_blocks and prevents manipulation of the rng
    mapping(address => uint256) public _minting_registry_salts;

    mapping(uint256 => bytes32) public tokenDna;

    IRandomHbbft private _random_hbbft;

    // mint registered event, 
    // emitted when a minting is registered
    // block_number is the block number of the block where minting becomes possible.
    event MintRegistered(address indexed account, uint256 blockNumber);

    constructor(address random_hbbft_address) ERC721("DemoNFT", "DEMO") {
        _random_hbbft = IRandomHbbft(random_hbbft_address);
    }

    /** @dev registers a minting of an NFT, paying the minting fee.
     * the receiver of the NFT can be an account other than the account who pays the fee.
     * Only one mint can be registered at a time.
     * @param _to the account that will receive the NFT.
     */
    function registerMinting(address _to) public payable {
        // if there is already a minting registered for the sender, then the minting is not allowed.
        require(
            _minting_registry_blocks[_to] == 0,
            "DemoNFT: minting already registered"
        );

        // the minting fee has to be paid for registering the minting.
        require(msg.value == mintingFee, "DemoNFT: must send exact minting fee");

        // the minting can only happen in the future,
        // all minting fees have to be paid during the registration.
        _minting_registry_blocks[_to] = block.number + 1;
        _minting_registry_salts[_to] = _currentMintingRegistrySalt;
        _currentMintingRegistrySalt++;

        emit MintRegistered(_to, block.number + 1);
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * The minting will fail if it has not been registered yet.
     * Minting can be called by anyone who has registered the minting.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to) public {

        uint256 blockNumber = _minting_registry_blocks[_to];

        // if there is no minting registered for the sender, then the minting is not allowed.
        require(
            blockNumber != 0,
            "DemoNFT: minting not registered"
        );

        require(
            block.number >= blockNumber,
            "RNG number for ready yet."
        );
        
        // clear the minting registry for this sender.
        _minting_registry_blocks[_to] = 0;
        _minting_registry_salts[_to] = 0;

        uint256 newTokenId = _getNextTokenId();
        _safeMint(_to, newTokenId);

        // the salt makes sure that registered mints for the same block do not result in the same DNA.
        // every salt is only used once.
        uint256 salt = _minting_registry_salts[_to];

        // get the RNG that has been written in the past. (including the same block, but the RNG transaction is the same)
        uint256 rng = _random_hbbft.get_seed_historic(blockNumber);

        tokenDna[newTokenId] = (keccak256(abi.encodePacked(rng, salt)));
        // according to the rule of big numbers, rng + salt should realistically never overflow and be unique.

        _incrementTokenId();
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId + 1;
    }

    /**
     * @dev increments the value of _currentTokenId
     */
    function _incrementTokenId() private {
        _currentTokenId++;
    }
}
