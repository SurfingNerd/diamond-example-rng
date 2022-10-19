// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/// @dev provides random seeds created by the cooperative consensus algorithm HBBFT.
interface IRandomHbbft {

    function getSeedHistoric(uint256 blockNumber)
        external
        view
        returns (uint256);
}
