
Testing environment：ganache-cli -m "pizza praise exercise grab base strong much subject rude sniff custom seed"

#1.Order test
seller bid:price amount
             6     2
             4     1
buyer bid:price amount
             4     1
             3     2

#2.Result
Using network 'development'.


Compiling your contracts...
===========================
> Compiling .\contracts\DoubleAuction.sol
> Compiling .\contracts\MathForDoubleAuction.sol
> Compiling .\contracts\Migrations.sol
> Artifacts written to C:\Users\76563\AppData\Local\Temp\test--33508-K0A8uXKAF2aH
> Compiled successfully using:
   - solc: 0.8.7+commit.e28d00a7.Emscripten.clang


  Contract: DoubleAuction
    Contract deployment
      √ Contract deployment (70ms)
    Buyer bid and seller bid
      √ buyers set bid and sellers set bid
    test marketClearing
      √ test marketClearing (1230ms)
    test MakePayment
Before MakePayment account balance
95.99774498
93.99834398
99.99774338
99.99834238
After MakePayment account balance
95.99699434
99.99749383999999
103.99683746
99.99761454
      √ test MakePayment (1016ms)
    test ClearAll
      √ test ClearAll (485ms)


  5 passing (3s)
