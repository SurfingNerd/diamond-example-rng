// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IRandomHbbft {
    function currentSeed() external view returns (uint256);

    function getSeedHistoric(uint256 blockNumber)
        external
        view
        returns (uint256);
}
