pragma solidity >=0.4.22 <=0.6.12;
contract old{

    struct Item{
        uint price;
        address payable seller;
        string website;
        string code;
        bool sold;
    }

    struct Transaction{
        Item item;
        address buyer;
    }

    mapping(address=>uint[]) seller_ratings;
    address payable public admin;
    Item[] items;
    Transaction[] transactions;

    constructor () public {
            admin = msg.sender;
        }

    modifier onlyAdmin() 
     {require(msg.sender == admin);
      _;
     }

    modifier verifiedPurchase(address seller){
        bool verified = false;
        for(uint i = 0; i<transactions.length; i++){
            if(transactions[i].item.seller == seller && transactions[i].buyer == msg.sender){
                verified = true;
            }
        }
        require(verified);
        _;
    }

    modifier lessThanFive(uint rating){
        require(rating <= 5 && rating >= 1, "Rating must be between one and five.");
        _;
    }

    function postItem(uint price, string memory website, string memory code) public{
        require(price >= 1);
        require(bytes(website).length > 0);
        require(bytes(code).length > 0);
        items.push(Item(price, msg.sender, website, code, false));
    }

    function buyItem(uint index) payable public{
        Item storage item = items[index];
        assert(item.sold == false);
        require(msg.value >= item.price);
        item.sold = true;
        transactions.push(Transaction(item, msg.sender));
        item.seller.transfer(msg.value - msg.value/10);
        admin.transfer(msg.value/10);
    }

    function rate(address seller, uint rating) public lessThanFive(rating) verifiedPurchase(seller){
        uint[] storage rats = seller_ratings[seller];
        rats.push(rating);
        seller_ratings[seller] = rats;
    }

    function get_rating(address seller) public view returns(uint average){
        if(seller_ratings[seller].length == 0){
            average = 0;
        }
        else{
            uint sum = 0;
            for(uint i = 0; i < seller_ratings[seller].length; i++){
                sum += seller_ratings[seller][i];
            }
            average = sum/seller_ratings[seller].length;
        }
        
    }

}