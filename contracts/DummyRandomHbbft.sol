import "./IRandomHbbft.sol";

// This is a dummy implementation of the IRandomHbbft interface.
// it can be used for developing and testing systems that rely on the HBBFT Random number system,
// without having to run a full HBBFT network.
// It is not intended to be used in production.
// It provides deterministic random numbers, based on the block number, that can be used for testing.
// The determinsticity 
contract DummyRandomHbbft is IRandomHbbft {

  function currentSeed() public view returns(uint256) {
    // convert the block number to bytes32.

    return uint256(keccak256(bytes32(block.number)));
  }

  function get_seed_historic(uint256 block_number) public view returns(uint256) {
    return uint256(keccak256(bytes32(block_number)));
  }
 }
