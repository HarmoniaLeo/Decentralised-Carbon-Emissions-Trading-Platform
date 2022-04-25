App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < 1; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

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

  // markAdopted: function() {
  //   var adoptionInstance;

  //   App.contracts.Adoption.deployed().then(function(instance) {
  //     adoptionInstance = instance;

  //     return adoptionInstance.getAdopters.call();
  //   }).then(function(adopters) {
  //     for (i = 0; i < adopters.length; i++) {
  //       if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
  //         $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
  //       }
  //     }
  //   }).catch(function(err) {
  //     window.alert(err.message);
  //   });
  // },

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
        return auctionInstance.market();
      }).then(function(address) {
        if (address == account)
        {
          window.alert("You are the deployer. ");
        }
        else
        {
          App.contracts.Auction.deployed().then(function(instance) {
            auctionInstance = instance;
            var price = $(".input-buyer-Price").val();
            var quantity = $(".input-buyer-Quantity").val();

            // Execute adopt as a transaction by sending account
            return auctionInstance.BuyerBid(account, quantity, price, {from: account, value: web3.toWei(price*quantity, 'ether'), gas: 2100000});
          }).catch(function(err) {
            window.alert(err.message);
          });
        }
      }).catch(function(err) {
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
        return auctionInstance.getAddresses({from: account});
      }).then(function(type) {
        if (type == 2)
        {
          window.alert("You are the deployer. ");
        }
        else if(type == 1)
        {
          window.alert("You already bided. Please wait for market clearing. ");
        }
        else
        {
          App.contracts.Auction.deployed().then(function(instance) {
            auctionInstance = instance;
            var price = $(".input-seller-Price").val();
            var quantity = $(".input-seller-Quantity").val();
            // Execute adopt as a transaction by sending account
            return auctionInstance.SellerBid(account, quantity, price, {from: account});//, value: web3.toWei(price*quantity, 'ether'), gas: 2100000});
          }).catch(function(err) {
            window.alert(err.message);
          });
        }
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
        return auctionInstance.market();
      }).then(function(address) {
        if (address == account)
        {
          App.contracts.Auction.deployed().then(function(instance) {
            auctionInstance = instance;
            return auctionInstance.marketClearing({from: account});
          }
          ).then(function(){
            App.contracts.Auction.deployed().then(function(instance) {
              auctionInstance = instance;
              return auctionInstance.clearingInfo();
            })
          });
        }
        else
        {
          window.alert("You are not the deployer. ");
        }
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
        return auctionInstance.market();
      }).then(function(address) {
        if (address == account)
        {
          App.contracts.Auction.deployed().then(function(instance) {
            auctionInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return auctionInstance.ClearAll({from: account});
          }).catch(function(err) {
            window.alert(err.message);
          });
        }
        else
        {
          window.alert("You are not the deployer. ");
        }
      }).catch(function(err) {
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
        return auctionInstance.market();
      }).then(function(address) {
        if (address == account)
        {
          window.alert("You are the deployer. ");
        }
        else
        {
          App.contracts.Auction.deployed().then(function(instance) {
            auctionInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return auctionInstance.MakePayment({from: account});
          }).catch(function(err) {
            window.alert(err.message);
          });
        }
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
