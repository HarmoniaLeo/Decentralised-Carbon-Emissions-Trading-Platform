// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
// Importing MathForDoubleAuction library: calculate average/quick sort descending/quick sort ascending
import "./MathForDoubleAuction.sol";

contract DoubleAuction is MathForDoubleAuction {

  struct Bid {
    int quantity;
    int price;
    bool exist; // this is added for checking whether one address has placed a bid.
  }
  struct Clearing {
    int clearingQuantity;
    int clearingPrice;
    int clearingType; // marginal_seller = 1, marginal_buyer = 2,  exact = 3, null = 4
  }

  address public market; // who deployed this contract 
  int[] _consumptionPrices; 
  int[] _generationPrices;
  mapping(int => int) consumptionBids;
  mapping(int => int) generationBids;
  mapping(address => Bid)  consumptionaddress;
  mapping(address => Bid)  generationaddress;
  Clearing public clearingInfo;
  int clearingpricebuyleft;
  int clearingpricesell;
  
  constructor  () { //invokes only once when deploy contract to initialize contract state
    market = msg.sender;
    clearingInfo.clearingPrice = 0;
    clearingInfo.clearingQuantity = 0;
    clearingInfo.clearingType = 0;
  }

  // buyers set bid
  function BuyerBid(address _buyer,int _quantity, int _price) payable public {
    if(consumptionBids[_price]==0){
      _consumptionPrices.push(_price);
      consumptionBids[_price] = _quantity;
    } else {
      consumptionBids[_price] = consumptionBids[_price] + _quantity;
    }
    consumptionaddress[_buyer].price=_price;
    consumptionaddress[_buyer].quantity=_quantity;
    consumptionaddress[_buyer].exist=true;
  }

   //sellers set bid
  function SellerBid(address _seller,int _quantity, int _price) payable public{
    if(generationBids[_price]==0){
      _generationPrices.push(_price);
      generationBids[_price] = _quantity;
    }else{
        generationBids[_price] = generationBids[_price] + _quantity;
    }
    generationaddress[_seller].price=_price;
    generationaddress[_seller].quantity=_quantity;
    generationaddress[_seller].exist=true;
  }
  

  function marketClearing() public {
    // at least one buyer and  oen seller,otherwise throw error
    require(_consumptionPrices.length > 0 && _generationPrices.length > 0,"Lack of bidder!"); 
    computeClearing();
  }
 
  function computeClearing() private {
    bool check = false;
    int demand_quantity = 0;
    int supply_quantity = 0;
    int buy_quantity = 0;
    int sell_quantity = 0;
    uint i = 0;  
    uint j = 0;
    
    //sort arrays, consumer's bid descending, producer's ascending
    quickSortDescending(_consumptionPrices, 0, int(_consumptionPrices.length - 1));
    quickSortAscending(_generationPrices, 0, int(_generationPrices.length - 1));

    Bid memory buy = Bid({
        quantity: consumptionBids[_consumptionPrices[i]],
        price: _consumptionPrices[i],
        exist:true});
            
    Bid memory sell = Bid({
        quantity: generationBids[_generationPrices[j]],
        price: _generationPrices[j],
        exist:true});
    clearingInfo.clearingType = 4;  //cleartype:null 4 no deal
    int b = sell.price; 
    int a = buy.price;
    while(i<_consumptionPrices.length && j<_generationPrices.length && buy.price>=sell.price){
        buy_quantity = demand_quantity + buy.quantity;
        sell_quantity = supply_quantity + sell.quantity;
        if (buy_quantity > sell_quantity){
            supply_quantity = sell_quantity;
            clearingInfo.clearingQuantity = sell_quantity;
            b = sell.price;
            a = sell.price;
            ++j;
            if(j < _generationPrices.length){
                sell.price =  _generationPrices[j];
                sell.quantity = generationBids[_generationPrices[j]];
            }
            check = false;
            clearingInfo.clearingType = 2; //clearingtype:marginal-buyer 2
            clearingpricebuyleft=buy_quantity-sell_quantity;
        }
        else if (buy_quantity < sell_quantity){
            demand_quantity = buy_quantity;
            clearingInfo.clearingQuantity = buy_quantity;
            b = sell.price;
            a = sell.price;
            i++;
                
            if(i < _consumptionPrices.length){
                buy.price =  _consumptionPrices[i];
                buy.quantity = consumptionBids[_consumptionPrices[i]];
            }
            check = false;
            clearingInfo.clearingType = 1; //clearingtype:marginal-seller 1
            clearingpricesell=sell.quantity-(sell_quantity-buy_quantity);
        }
        else{
            supply_quantity = buy_quantity;
            demand_quantity = buy_quantity;
            clearingInfo.clearingQuantity = buy_quantity;
            a = buy.price;
            b = sell.price;
            i++;
            j++;

            if(i < _consumptionPrices.length){
                buy.price =  _consumptionPrices[i];
                buy.quantity = consumptionBids[_consumptionPrices[i]];
            }
            if(j < _generationPrices.length){
                sell.price =  _generationPrices[j];
                sell.quantity = generationBids[_generationPrices[j]];
            }
            check = true; //check for whether one side exhausted
        }
        
    if(a == b){
        clearingInfo.clearingPrice = a;
    }
    if(check){ /* one side exhausted check */
        clearingInfo.clearingPrice = a;
        if(i == _consumptionPrices.length && j <  _generationPrices.length){
            clearingInfo.clearingType = 1;// exhausted buyers, sellers unsatisfied at same price
        } 
        else if (i < _consumptionPrices.length && j == _generationPrices.length){ 
            clearingInfo.clearingType = 2;// exhausted sellers, buyers unsatisfied at same price
        } 
        else { 
            clearingInfo.clearingType = 3;// both sides exhausted at same quantity
        }
        }
    }
    
    if (clearingInfo.clearingQuantity==0 && a!=b){
        clearingInfo.clearingType = 4; 
        clearingInfo.clearingPrice = MathForDoubleAuction.getAvg(a,b);
    }
  }

  function ClearAll() public {
    for (uint cleanConsumptionIndex = 0; cleanConsumptionIndex < _consumptionPrices.length; cleanConsumptionIndex++){
      int consPrice = _consumptionPrices[cleanConsumptionIndex];
      consumptionBids[consPrice] = 0;
    }//clear mapping
    for (uint cleanGenerationIndex = 0; cleanGenerationIndex < _generationPrices.length; cleanGenerationIndex++){
      int genPrice = _generationPrices[cleanGenerationIndex];
      generationBids[genPrice] = 0;
    }
    delete _consumptionPrices; //delete arrays
    delete _generationPrices;
    clearingInfo.clearingPrice=0;//update clearing information
    clearingInfo.clearingQuantity=0;
    clearingInfo.clearingType=6;
  }

  function MakePayment()public payable {
    address payable recipiant;
    uint value;
    require(consumptionaddress[msg.sender].exist==true||generationaddress[msg.sender].exist==true,"Neither a buyer, nor a seller.");
    recipiant = payable(msg.sender);
    if (consumptionaddress[recipiant].exist==true){
     if(consumptionaddress[recipiant].price < clearingInfo.clearingPrice){
       value = uint(consumptionaddress[recipiant].price * consumptionaddress[recipiant].quantity);
     }
     else if(consumptionaddress[recipiant].price > clearingInfo.clearingPrice){
       value = uint((consumptionaddress[recipiant].price-clearingInfo.clearingPrice) * consumptionaddress[recipiant].quantity);
     }
     else{
       value = uint(clearingInfo.clearingPrice * clearingpricebuyleft);
     }
    }
    if (generationaddress[recipiant].exist==true){// I use 2 if here instead of if-else, so that a buyer can also be a seller
      if(generationaddress[recipiant].price < clearingInfo.clearingPrice){
       value = uint(clearingInfo.clearingPrice * generationaddress[recipiant].quantity);
     }
     else if(generationaddress[recipiant].price == clearingInfo.clearingPrice){
       value = uint(clearingInfo.clearingPrice * clearingpricesell);
     }
     else{
       value = uint(0);
     }
    }
    (bool success, ) =recipiant.call{gas:40000,value:value*1000000000000000000}(""); // take 1 ETH as 1 unit, 10^18 wei= 1 ETH
    require(success, "Payment failed");
  }
}