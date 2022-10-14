pragma solidity ^0.8.0;


interface IRandomHbbft {
    function currentSeed() external view returns(uint256);

    function get_seed_historic(uint256 block_number) external view returns(uint256);
}
