// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./interfaces/IRandomHbbft.sol";

// This is a dummy implementation of the IRandomHbbft interface.
// it can be used for developing and testing systems that rely on the HBBFT Random number system,
// without having to run a full HBBFT network.
// It is not intended to be used in production.
// It provides deterministic random numbers, based on the block number, that can be used for testing.
// The determinsticity
contract DummyRandomHbbft is IRandomHbbft {
    function currentSeed() external view override returns (uint256) {
        // convert the block number to bytes32.

        return uint256(keccak256(abi.encode(block.number)));
    }

    function getSeedHistoric(uint256 blockNumber)
        external
        pure
        override
        returns (uint256)
    {
        return uint256(keccak256(abi.encode((blockNumber))));
    }
}