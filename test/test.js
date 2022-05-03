
const DoubleAuction  = artifacts.require('DoubleAuction.sol');
let auctionInstance;

contract('DoubleAuction',accounts => {
    describe('Contract deployment', function () {
        it('Contract deployment', function () {
            return DoubleAuction.deployed().then(function (instance) {
                auctionInstance = instance;
                assert(
                    auctionInstance !== undefined,
                    'Auction contract should be defined'
                );
            });
        });
    });
    describe("Buyer bid and seller bid", () => {
        it("buyers set bid and sellers set bid", () => {
            auctionInstance.BuyerBid(accounts[1],1,4,{value:4*10**18,from:accounts[1]})
            auctionInstance.BuyerBid(accounts[2],2,3,{value:6*10**18,from:accounts[2]})
            auctionInstance.SellerBid(accounts[3],1,4,{from:accounts[3]})
            auctionInstance.SellerBid(accounts[4],2,6,{from:accounts[4]})
        });
    });
    describe("test marketClearing", () => {
        it("test marketClearing", async () => {
            await auctionInstance.marketClearing()
            let clearingInfo=await auctionInstance.clearingInfo();
            assert(
                clearingInfo.clearingPrice == 4,
                'Price failed'
            )
            assert(
                clearingInfo.clearingQuantity == 1,
                'Quantity failed'
            )
            assert(
                clearingInfo.clearingType == 3,
                'Type failed'
            )
            

        });
    });
    describe("test MakePayment", () => {
        it("test MakePayment", async () => {
            console.log("Before MakePayment account balance")
            console.log(await web3.eth.getBalance(accounts[1])/1000000000000000000)
            console.log(await web3.eth.getBalance(accounts[2])/1000000000000000000)
            console.log(await web3.eth.getBalance(accounts[3])/1000000000000000000)
            console.log(await web3.eth.getBalance(accounts[4])/1000000000000000000)
            await auctionInstance.MakePayment({from:accounts[1]})
            await auctionInstance.MakePayment({from:accounts[2]})
            await auctionInstance.MakePayment({from:accounts[3]})
            await auctionInstance.MakePayment({from:accounts[4]})
            console.log("After MakePayment account balance")
            console.log(await web3.eth.getBalance(accounts[1])/1000000000000000000)
            console.log(await web3.eth.getBalance(accounts[2])/1000000000000000000)
            console.log(await web3.eth.getBalance(accounts[3])/1000000000000000000)
            console.log(await web3.eth.getBalance(accounts[4])/1000000000000000000)
        });
    });
    describe("test ClearAll", () => {
        it("test ClearAll", async () => {
            await auctionInstance.ClearAll()
        });
    });
});

