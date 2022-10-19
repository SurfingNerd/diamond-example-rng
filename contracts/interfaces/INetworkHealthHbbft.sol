// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/// @dev provides a health state of the HBBFT Network.
/// a bad health state could result in manipulation of the random seed.
interface INetworkHealthHbbft {
    /// @dev returns true if the network operates normally and provides best random numbers.
    function isFullHealth() external view returns (bool);

    /// @dev returns true if the network did operate normally and provides best random numbers at the given block.
    /// @param blockNumber the block number to check.
    function isFullHealthHistoric(uint256 blockNumber)
        external
        view
        returns (bool);
}
