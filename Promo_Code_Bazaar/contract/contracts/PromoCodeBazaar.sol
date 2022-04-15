pragma solidity >=0.4.22 <= 0.6.12;
contract PromoCodeBazaar{

    address payable public admin;

     constructor () public {
            admin = msg.sender;
        }

    function buy(address payable seller) payable public{
        seller.transfer(msg.value - msg.value/10);
        admin.transfer(msg.value/10);
    }

}