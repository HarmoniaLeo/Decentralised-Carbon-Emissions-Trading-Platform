App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    //Call an asynchronous function to init the web3 provider
    return await App.initWeb3();  
  },

  //The asynchronous function to init the web3 provider
  initWeb3: async function() {
    //MetaMask injects a global API into websites visited by its users at window.ethereum. 
    //This API allows websites to request users' Ethereum accounts, read data from blockchains the user is connected to, and suggest that the user sign messages and transactions.
    App.web3Provider = window.ethereum;
    await window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  //Instantiate contract artifact
  initContract: function() {

      $.getJSON('DoubleAuction.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AuctionArtifact = data;
      App.contracts.Auction = TruffleContract(AuctionArtifact);
    
      // Set the provider for our contract
      App.contracts.Auction.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      //return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-BuyerBid', App.handleBuyerBid);
    $(document).on('click', '.btn-SellerBid', App.handleSellerBid);
    $(document).on('click', '.btn-marketClearing', App.handlemarketClearing);
    $(document).on('click', '.btn-ClearAll', App.handleClearAll);
    $(document).on('click', '.btn-buyer-MakePayment', App.handleMakePayment);
    $(document).on('click', '.btn-seller-MakePayment', App.handleMakePayment);
  },

  handleBuyerBid: function(event) {
    event.preventDefault();

    var auctionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        window.alert(error);
      }

      var account = accounts[0];

      App.contracts.Auction.deployed().then(function(instance) {
        auctionInstance = instance;
        var price = $(".input-buyer-Price").val();
        var quantity = $(".input-buyer-Quantity").val();
        return auctionInstance.BuyerBid(account, quantity, price, {from: account, value: web3.toWei(price*quantity, 'ether'), gas: 2100000});
        }
      ).catch(function(err) {
        window.alert(err.message);
      });
    });
  },

  handleSellerBid: function(event) {
    event.preventDefault();

    var auctionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        window.alert(error);
      }

      var account = accounts[0];

      App.contracts.Auction.deployed().then(function(instance) {
        auctionInstance = instance;
        var price = $(".input-seller-Price").val();
        var quantity = $(".input-seller-Quantity").val();
        return auctionInstance.SellerBid(account, quantity, price, {from: account, gas: 2100000});
      }).catch(function(err) {
        window.alert(err.message);
      });
    });
  },

  handlemarketClearing: function(event) {
    event.preventDefault();

    var auctionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        window.alert(error);
      }

      var account = accounts[0];

      App.contracts.Auction.deployed().then(function(instance) {
        auctionInstance = instance;
        return auctionInstance.marketClearing({from: account});
      
    }).then(function(code){
      window.alert(code);
    }).then(function(){
      return auctionInstance.clearingInfo();
    }).then(function(clearingInfo){
      $(".td-ClearingPrice").html(String(clearingInfo[0]));
      $(".td-ClearingQuantity").html(String(clearingInfo[1]));
      if (clearingInfo[2] == 0)
      {
        $(".td-ClearingType").html("Error");
      }
      else if (clearingInfo[2] == 1)
      {
        $(".td-ClearingType").html("Marginal Seller");
      }
      else if (clearingInfo[2] == 2)
      {
        $(".td-ClearingType").html("Marginal Buyer");
      }
      else if (clearingInfo[2] == 3)
      {
        $(".td-ClearingType").html("Exact");
      }
      else if (clearingInfo[2] == 4)
      {
        $(".td-ClearingType").html("Null");
      }
    }).catch(function(err) {
        window.alert(err.message);
      });
    });
  },

  handleClearAll: function(event) {
    event.preventDefault();

    var auctionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        window.alert(error);
      }

      var account = accounts[0];

      App.contracts.Auction.deployed().then(function(instance) {
        auctionInstance = instance;
        return auctionInstance.ClearAll({from: account});
      }).then(function(){
        $(".td-ClearingPrice").html();
        $(".td-ClearingQuantity").html();
        $(".td-ClearingType").html();
      }
      ).catch(function(err) {
        window.alert(err.message);
      });

    });
  },

  handleMakePayment: function(event) {
    event.preventDefault();

    var auctionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        window.alert(error);
      }

      var account = accounts[0];

      App.contracts.Auction.deployed().then(function(instance) {
        auctionInstance = instance;
        return auctionInstance.MakePayment({from: account});
      }).catch(function(err) {
        window.alert(err.message);
      });

    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
