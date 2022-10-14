pragma solidity ^0.8.0;


interface IRandomHbbft {
    function currentSeed() view returns(uint256);

    function get_seed_historic(uint256 block) view returns(uint256);
}
