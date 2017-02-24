var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:roll', function(req, res, next) {
  let box = {
    'entry': '',
    'type': '',
    'format': '',
    'total': 0
  }

  //This is the raw roll
  let raw_expression  = req.params.roll;

  let split_plusses = raw_expression.split("+");
  console.log(split_plusses);

  // for each split plus

  // if it can be split by a minus,

    // add the first expression
    // then, subtract the second expression
    // the move on to the next split plus

  // otherwise, add the expression and move onto the next split plus

  let split_minuses = raw_expression.split("-");
  console.log(split_minuses);

  box.entry = raw_expression;

  evaluateExpression(raw_expression);

  function evaluateExpression(expression) {
    console.log('raw expression:', expression);

    if (isXAnyPositiveNumber(expression)) {  // Check if its a literal value, if so just return it            d
      console.log(expression,"its a positive number with the length of",expression.length);
      console.log('returing literal d');
      box.format = 'd';
      box.type = 'Literal value'
      box.total = Number(expression);
      finishRoll();
    }
    else {

      if (expression.indexOf('d') === 0) {  // if 'd' is the first item in the string:
        console.log('d is the first letter in the string');
        box.format = 'dString'

        let rightOfFirstD = expression.substring(1,expression.length);
        console.log("right of first d:",rightOfFirstD);

        if (isXAnyPositiveNumber(rightOfFirstD)) { // ... and if the only thing after it is a positive number (X):    dX
          box.format = 'dX';
          box.type = 'One die roll'
          box.total = rollOneDi(Number(rightOfFirstD))
        }
        else {  // ... or if the thing after it is not a positve number, return an error
          box.format = 'ERR';
        }

      }
      else if (expression.indexOf('d') > 0){ // if 'd' is in the string, but is not the first letter
        console.log('d is NOT the first character in the string, but it is in the string');
        box.format = 'stringd'

        let leftOfFirstD = expression.substring(0,expression.indexOf('d'));
        console.log('left of first d:',leftOfFirstD);

        if (isXAnyPositiveNumber(leftOfFirstD)) {   // if 'd' is to the right of a positive number (N)
          let nDice = leftOfFirstD;

          let rightOfFirstD = expression.substring(expression.indexOf('d')+1,expression.length);
          console.log("right of first d:",rightOfFirstD);

          if (isXAnyPositiveNumber(rightOfFirstD)) { //if the only thing to the right of 'd' is a positive number (X):    NdX
              console.log("rolling ",leftOfFirstD," dice, each with",rightOfFirstD,"sides");

              box.format = 'NdX';
              box.type = 'Dice roll';

              let numberOfSides = rightOfFirstD;
              let diNumber = 1;

              while (diNumber <= nDice) { // roll N dice with X sides
                //console.log('roll #', diNumber);
                box.total += rollOneDi(numberOfSides);
                diNumber += 1;
              }
          }

          else {  // if the only thing to the right of 'd' is not a number
            box.format = "Ndstring"
              if (isBetweenTwoNumbers(rightOfFirstD, 'k')) { // if the thing the the right of the 'd' is a string containting a 'k' surrounded by two numbers
                console.log("there is a k in the string to the right of the d surrounded by two numbers");
                box.format = "NdXkK";
                box.type = "Keep highest rolls";

                let factors = isBetweenTwoNumbers(rightOfFirstD, 'k');
                let nSides = factors[0];
                let nKeep = factors[1];

                let results = [];

                while (results.length < nDice) {
                  results.push(rollOneDi(nSides))
                }
                console.log('results:', results);

                let resultsHighToLow = results.sort(sortResults).reverse()
                console.log('results high to low:', resultsHighToLow);

                let resultsToKeep = resultsHighToLow.slice(0,nKeep);
                console.log('results to keep:', resultsToKeep);

                box.total = sumResults(resultsToKeep);
                console.log('sum of results to keep:', sumResults(resultsToKeep));

              } else if (isBetweenTwoNumbers(rightOfFirstD, 'd')) { // if the thing the the right of the 'd' is a string containting a second 'd' surrounded by two numbers
                console.log("there is a d in the string to the right of the first d surrounded by two numbers");
                box.format = "NdXdD";
                box.type = "Drop lowest rolls";

                let factors = isBetweenTwoNumbers(rightOfFirstD, 'd');
                let nSides = factors[0];
                let nDrop = factors[1];

                let results = [];

                while (results.length < nDice) {
                  results.push(rollOneDi(nSides))
                }
                console.log('results:', results);

                let resultsHighToLow = results.sort(sortResults).reverse()
                console.log('results high to low:', resultsHighToLow);

                let resultsToKeep = resultsHighToLow.slice(0,nDice-nDrop);
                console.log('results to keep:', resultsToKeep);

                box.total = sumResults(resultsToKeep);
                console.log('sum of results to keep:', sumResults(resultsToKeep));

              }
              else if (isBetweenTwoNumbers(rightOfFirstD, 'x')) { // if the thing the the right of the 'd' is a string containting a 'x' surrounded by two numbers
                console.log("there is a x in the string to the right of the d surrounded by two numbers");
                box.format = "NdXxE";
                box.type = "Explosive roll";

                let factors = isBetweenTwoNumbers(rightOfFirstD, 'x');
                let nSides = factors[0];
                let nExplode = factors[1];

                let resultsUnderE = [];
                let resultsOverE = [];

                while (resultsUnderE.length < nDice) {
                  let oneRoll = rollOneDi(nSides);
                  if (oneRoll >= nExplode) {
                    resultsOverE.push(oneRoll)
                  } else {
                    resultsUnderE.push(oneRoll)
                  }
                }

                console.log('results under e:', resultsUnderE);
                console.log('results over e:', resultsOverE);

                let allResults = resultsUnderE.concat(resultsOverE);
                console.log('all results:', allResults);

                box.total = sumResults(allResults);
                console.log('sum of all results: ',sumResults(allResults));


              } else {  // if the right of 'd' string contains neither a 'k', 'x', or 'd', return an error
                console.log("there is not a k, x, or d in the string to the right of the d");
                box.format = "ERR";
                box.total = "ERR";
              }
          }

        } else { // if 'd' is to the right of anything but a positive number
          console.log('thing before first "d" is not a positive number');
          box.format = 'ERR';
          box.total = 'ERR';
        }

      } else {  // If 'd' is not in the string, return an error
        console.log('d is NOT in the string');
        box.format = 'ERR';
        box.total = 'ERR';
      }
      finishRoll()
    }
  }

  function finishRoll() {
    res.json(box);
  }

});

function isXAnyPositiveNumber(X) {
  if (Math.floor(Number(X)) == X){
    if (0 < X) {
      return Math.floor(Number(X));
    }
  }
  return false;
}

function rollOneDi(nSides) {
  let randomFactor = Math.random();
  // console.log("random factor:",randomFactor);
  let result = Math.floor(randomFactor*nSides)+1
  // console.log("result:",result);
  return result
}

function isBetweenTwoNumbers(string, letter) {
  let parts = string.split(letter);
  if (parts.length === 2 && isXAnyPositiveNumber(parts[0]) && isXAnyPositiveNumber(parts[1])) {
    return parts;
  } else {
    return false;
  }
}

function sortResults(a,b) {
  return a-b;
}

function sumResults(results) {
  let sum = 0;
  for (result of results) {
    sum += result;
  }
  return sum;
}

module.exports = router;
