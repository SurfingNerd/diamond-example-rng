// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./interfaces/INetworkHealthHbbft.sol";

contract DummyNetworkHealthHbbft is INetworkHealthHbbft {
    //indexed access to historic health values
    //the burden of inefficient value lookups has
    // been taken to keep tests simple.
    // otherwise we would need to write a health value
    // in each block.
    bool[] public historicHealthValues;
    uint256[] public historicHealthBlocks;

    bool public currentHealthValue = true;

    constructor() {
        setHealth(true);
    }

    /// @dev mock function for tests to set the healthy value.
    /// @param healthy the new health parameter.
    function setHealth(bool healthy) public {
        currentHealthValue = healthy;
        historicHealthValues.push(healthy);
        historicHealthBlocks.push(block.number);
    }

    /// @dev returns true if the network operates normally and provides best random numbers.
    function isFullHealth() external view returns (bool) {
        return currentHealthValue;
    }

    /// @dev returns true if the network operates normally and provides best random numbers.
    function isFullHealthHistoric(uint256 blockNumber)
        external
        view
        returns (bool)
    {
        // we iterate over the array to find the block number in the index.
        // a faster lookup algorithm would be possible,
        // but the tests won't produce much data.
        for (uint256 i = 0; i < historicHealthBlocks.length; i++) {
            if (blockNumber <= historicHealthBlocks[i]) {
                return historicHealthValues[i];
            }
        }
        return currentHealthValue;
    }
}
