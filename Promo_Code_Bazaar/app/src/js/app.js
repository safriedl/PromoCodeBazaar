App = {
    contracts: {},
    url: 'http://127.0.0.1:7545',
    init: function() {
      //App.pushItems();


      return App.initWeb3();
    },

    initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();
    

    return App.initContract();
  },

  bindEvents: function() {
    $(document).on('submit', 'form', App.handleForms);
    $(document).on('click', '.btn-buy', App.handleBuy);
  },


  initContract: function() {
    $.getJSON('PromoCodeBazaar.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with truffle-contract
    var artifact = data;
    App.contracts.buy = TruffleContract(artifact);

    // Set the provider for our contract
    App.contracts.buy.setProvider(App.web3Provider);
    App.pushItems();

    return App.bindEvents();
  });
  },

  pushItems: function(){
    jQuery.get('/loadItems', function(data){
      jQuery.get('/getRatings', function(data_r){

        
        //alert("DATA " + data);
        var itemsRow = $('#itemsRow');
        var itemsTemplate = $('#itemsTemplate');
        itemsRow.empty('#itemsRow');

        for (i = 0; i < data.length; i ++) {
          if(!data[i].sold){
            itemsTemplate.find('.website-name').text(data[i].website);
            itemsTemplate.find('.price').text(data[i].price);
            itemsTemplate.find('.seller-address').text(data[i].seller_address);
            //itemsTemplate.find('.seller-rating').text("N/A"); //placeholder
            itemsTemplate.find('.description').text(data[i].description);
            itemsTemplate.find('.btn-buy').attr('data-id', data[i].id);

            let rating = 0;
            let addresses = Object.keys(data_r);
            const average = (array) => array.reduce((a, b) => a + b) / array.length;
            for(j = 0; j < addresses.length; j++){
              if(data[i].seller_address == addresses[j]){
                rating = average(data_r[addresses[j]]);
              }
            }
            if(rating > 0){
              itemsTemplate.find('.seller-rating').text(rating);
            }
            else{
              itemsTemplate.find('.seller-rating').text("This user has no rating currently.");
            }


            itemsRow.append(itemsTemplate.html());
          }
        }
      });
    });
  },

  handleForms: function(event) {
    //event.preventDefault();
    if($(this).attr('id') == "form1"){  //if post
      var form = $(this).serialize().split(/[&=]/);
      var website = form[1];
      var code = form[3];
      var price = form[5];
      var description = form[7];
      //alert(website + code + price + description);
      var seller_address = undefined;
      //var b_instance;

      web3.eth.getAccounts(function(error, accounts) {
        seller_address = accounts[0];
        //alert(seller_address);
        let item = [{
          price:price,
          website:website,
          code:code,
          seller_address:seller_address,
          description:description,
          sold:false,
          id: Date.now()
      }];
        let data = JSON.stringify(item);
        jQuery.post('/addItem', data);
        App.pushItems();
        return false;
      });
    }
    else{  //if rate
      var form = $(this).serialize().split(/[&=]/);
      var id = form[1];
      var rating = form[3];
      if(Number(rating) > 5 || Number(rating) < 1){
        alert("Rating has to be between 1 and 5.");
        return;
      }
      var inItems = false;
      jQuery.get('/getTxs', function(data){
        var tx = undefined;
        for (i = 0; i < data.length; i ++) {
          if(data[i].id == id){
            inItems = true;
            tx = data[i];
          }
        }
        if(!inItems){
          alert("Item ID not found.")
          return;
        }
        let r_d = [{
          rating: rating,
          seller: tx.seller_address,
          id: tx.id
        }];
        alert(rating);
        alert(tx.seller_address);
        alert(tx.id);

        jQuery.post('/addRating', JSON.stringify(r_d));
        App.pushItems();
      });
      
      //jQuery.post('/addRating');


      //alert(seller_address + rating);
    }
  },

  handleBuy: function(event) {
    event.preventDefault();
    var itemID = parseInt($(event.target).data('id'));
    //alert("FIRST " + itemID);
    itemIndex = -1;
    let item_json = undefined;
    jQuery.get('/loadItems', function(data){  
      //alert(JSON.stringify(data));
      for (i = 0; i < data.length; i ++) {
        //alert(data[i].id == itemID);
        if(data[i].id == itemID){
          //alert("SECOND " + data[i].id);
          itemIndex = i;
          item_json = data[i];
        }
      }
      //alert(itemIndex);
      if(itemIndex == -1){
        alert("Item not found!");
        return;
      }
      let buyer_address;
      web3.eth.getAccounts(function(error, accounts) {
        buyer_address = accounts[0];
        App.contracts.buy.deployed().then(function(instance) {
          return instance.buy(item_json.seller_address, {from: buyer_address, value: parseInt(item_json.price)}).then(function(result, err){
            if(result){
                console.log(result.receipt.status);
                if(parseInt(result.receipt.status) == 1){
                  alert(buyer_address + " buying done successfully");
                  jQuery.post('/buyItem', JSON.stringify(item_json));
                  let tx = [{
                    id: item_json.id,
                    buyer_address: buyer_address,
                    seller_address: item_json.seller_address
                  }];
                  jQuery.post('/updateTxs', JSON.stringify(tx));
                  App.pushItems();
                  //alert(item_json.price);
                  alert("YOUR CODE IS: " + item_json.code);
                  alert("YOUR ONE TIME PASSWORD FOR RATING IS: " + item_json.id);
                }
                else
                alert(buyer_address + " buying not done successfully due to revert")
            } else {
                alert(buyer_address + " buying failed")
            }   
        });
          
        });
        return false;
      }); 
    });
  },
  
}

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
