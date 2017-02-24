## Dice API

 This is an api with a front-end for evaluating dice roll expressions.

###### Here are the routes:
* Client: /
* API: /*expression**

###### Valid API Expressions:

* *X* : **Literal Value**. Where X is any positive number.

* *dX*​ : **One die roll**​. Where X​ is any positive number. Roll 1​ die with X​ sides.

* *N​dX*​ : **Dice roll**​. Where N​ is any positive number. Roll N​ dice with X​ sides and sum.

* *NdXdD* : **Drop lowest rolls**. Where D​ is any positive number lower than N​. Roll N​ dice with
X​ sides and drop the lowest D​ dice and sum.

* *N​dX​kK*​ : **Keep highest rolls**​. Where K​ is any positive number lower than N​. Roll N​ dice
with X​ sides and keep the highest K​ dice and sum.

* *N​dX​xE* ​: **Explosive roll​**. Where E​ is any positive number equal or smaller than X​. Roll N
dice with X​ sides. For each value that is equal or greater than E​ roll again until no values
need to be re-rolled.

* *Expression + Expression* : **Addition**. Add any two valid expressions together.

* *Expression - Expression* : **Subtraction**. Subtract any one valid expression from any other valid expression.
