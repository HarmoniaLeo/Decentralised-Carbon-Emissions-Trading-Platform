pragma solidity ^0.8.0;

contract Adoption {
    address[16] public adopters;

    function adopt(uint petId) payable public returns (uint) {
        require(petId >= 0 && petId <= 15);

        adopters[petId] = msg.sender;

        return petId;
    }

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}