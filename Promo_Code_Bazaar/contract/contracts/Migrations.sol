pragma solidity >=0.4.22 <=0.6.12;
contract Migrations{
  address public admin;
  uint public last_completed_migration;

  constructor() public {
    admin = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == admin) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }
}