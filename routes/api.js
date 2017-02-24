var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:roll', function(req, res, next) {
  let box = { // this is the object that will be sent back to the client
    'entry': '',
    'type': '',
    'format': '',
    'total': 0
  }

  let raw_expression  = req.params.roll; //This is the raw roll
  box.entry = raw_expression;

  let split_plusses = raw_expression.split("+"); // these are potential arrays of two expressions to be added/subtracted
  let split_minuses = raw_expression.split("-");

  if (split_plusses.length === 2 && split_minuses.length === 1) { // this is the case where two expressions are to be added
    box.type = "Addition";

    let expression1Total = evaluateExpression(split_plusses[0]); // evaluate both expressions
    let expression2Total = evaluateExpression(split_plusses[1]);

    if (typeof expression1Total === 'number' || typeof expression2Total === 'number') { // make sure each expression is valid
      box.total = expression1Total + expression2Total; // sum the two totals
    } else {
      box.error = "Invalid Entry. Please see directions."; // handle the error for an invalid expression
    }
    finishRoll(); // close the request
  } else if (split_plusses.length === 1 && split_minuses.length === 2) { // if an expression is being subtracted from abother
    box.type = "Subtraction"

    let expression1Total = evaluateExpression(split_minuses[0]); // evaluate both expressions
    let expression2Total = evaluateExpression(split_minuses[1]);

    if (typeof expression1Total === 'number' || typeof expression2Total === 'number') { // make sure each expression is valid
      box.total = expression1Total - expression2Total; // subtract the second expression from the first
    } else {
      box.error = "Invalid Entry. Please see directions."; // handle the error for an invalid expression
    }
    finishRoll();
  } else if (split_plusses.length === 1 && split_minuses.length === 1) { // if just one expression is being given
    box.total = evaluateExpression(raw_expression); // evaluate the expression
    finishRoll(); // close the request
  } else { // if more than two expressions are trying to be added or subtracted
    box.error = "The adding/subtracting of more than two expressions is not currently supported.";
    finishRoll(); // close the request
  }

  function evaluateExpression(expression) { // this evaluates the expression and returns its total value
    if (isXAnyPositiveNumber(expression)) {  // Check if its a literal value, if so just return it (d)
      if (box.type === '') { // this sets the type and format based on if expressions are being added/subtracted or not
        box.type = 'Literal value';
        box.format = 'd';
      } else {
        if (box.format === '') {
          box.format = 'd'
        } else {
          if (box.type === "Addition") {
            box.format += " + d";
          } else {
            box.format += " - d";
          }
        }
      }
      return Number(expression); // returns the literal value
    } else { // for anything else thats not a literal value

      if (expression.indexOf('d') === 0) {  // if 'd' is the first item in the string

        let rightOfFirstD = expression.substring(1,expression.length);

        if (isXAnyPositiveNumber(rightOfFirstD)) { // ... and if the only thing after it is a positive number (X):    dX
          let numberSides = rightOfFirstD;

          if (box.type === '') { // this sets the type and format based on if expressions are being added/subtracted or not
            box.type = 'One die roll';
            box.format = 'dX';
          } else {
            if (box.format === '') {
              box.format = 'dX'
            } else {
              if (box.type === "Addition") {
                box.format += " + dX";
              } else {
                box.format += " - dX";
              }
            }
          }
          return rollOneDi(Number(numberSides)) // returns the value of one di with specified number of sides
        } else {  // ... or if the thing after it is not a positve number
          box.error = "Invalid Entry. Please see directions.";
          return "ERR"; //, return an error
        }
      } else if (expression.indexOf('d') > 0){ // if 'd' is in the string, but is not the first letter
        let leftOfFirstD = expression.substring(0,expression.indexOf('d'));

        if (isXAnyPositiveNumber(leftOfFirstD)) {   // if 'd' is to the right of a positive number (N)
          let nDice = leftOfFirstD;

          let rightOfFirstD = expression.substring(expression.indexOf('d')+1,expression.length);

          if (isXAnyPositiveNumber(rightOfFirstD)) { //if the only thing to the right of 'd' is a positive number (X):    NdX
              let numberOfSides = rightOfFirstD;

              if (box.type === '') { // this sets the type and format based on if expressions are being added/subtracted or not
                box.type = 'Dice roll';
                box.format = 'NdX';
              } else {
                if (box.format === '') {
                  box.format = 'NdX'
                } else {
                  if (box.type === "Addition") {
                    box.format += " + NdX";
                  } else {
                    box.format += " - NdX";
                  }
                }
              }

              let tempTotal = 0;
              let diNumber = 1;

              while (diNumber <= nDice) { // roll N dice with X sides
                tempTotal += rollOneDi(numberOfSides); // sums up all rolls
                diNumber += 1; // counts the rolls
              }
              return tempTotal;
          }  else {  // if the only thing to the right of 'd' is not a number
              if (isBetweenTwoNumbers(rightOfFirstD, 'k')) { // if the thing the the right of the 'd' is a string containting a 'k' surrounded by two numbers

                if (box.type === '') { // this sets the type and format based on if expressions are being added/subtracted or not
                  box.type = 'Keep highest rolls';
                  box.format = 'NdXkK';
                } else {
                  if (box.format === '') {
                    box.format = 'NdXkK'
                  } else {
                    if (box.type === "Addition") {
                      box.format += " + NdXkK";
                    } else {
                      box.format += " - NdXkK";
                    }
                  }
                }

                let factors = isBetweenTwoNumbers(rightOfFirstD, 'k'); // check if 'k' is between two numbers
                let nSides = factors[0]; // number of sides on each dice
                let nKeep = factors[1]; // number of dice to keep

                let results = [];

                while (results.length < nDice) { // keeps rolling dice until the number of results matches the number of rolls
                  results.push(rollOneDi(nSides))
                }

                let resultsHighToLow = results.sort(sortResults).reverse() // puts results in order from high to low
                let resultsToKeep = resultsHighToLow.slice(0,nKeep); // determines the number of results to keep

                return sumResults(resultsToKeep); // return a sum of the results
              } else if (isBetweenTwoNumbers(rightOfFirstD, 'd')) { // if the thing the the right of the 'd' is a string containting a second 'd' surrounded by two numbers

                if (box.type === '') { // this sets the type and format based on if expressions are being added/subtracted or not
                  box.type = 'Drop lowest rolls';
                  box.format = 'NdXdD';
                } else {
                  if (box.format === '') {
                    box.format = 'NdXdD'
                  } else {
                    if (box.type === "Addition") {
                      box.format += " + NdXdD";
                    } else {
                      box.format += " - NdXdD";
                    }
                  }
                }

                let factors = isBetweenTwoNumbers(rightOfFirstD, 'd'); // check if 'd' is between two numbers
                let nSides = factors[0]; // number of sides on each dice
                let nDrop = factors[1]; // number of dice to drop

                let results = [];

                while (results.length < nDice) { // keeps rolling dice until the number of results matches the number of rolls
                  results.push(rollOneDi(nSides));
                }

                let resultsHighToLow = results.sort(sortResults).reverse();  // puts results in order from high to low
                let resultsToKeep = resultsHighToLow.slice(0,nDice-nDrop); // determines which results to drop (by keeping th others)

                return sumResults(resultsToKeep); // return a sum of the results
              } else if (isBetweenTwoNumbers(rightOfFirstD, 'x')) { // if the thing the the right of the 'd' is a string containting a 'x' surrounded by two numbers

                if (box.type === '') { // this sets the type and format based on if expressions are being added/subtracted or not
                  box.type = 'Explosive roll';
                  box.format = 'NdXxE';
                } else {
                  if (box.format === '') {
                    box.format = 'NdXxE'
                  } else {
                    if (box.type === "Addition") {
                      box.format += " + NdXxE";
                    } else {
                      box.format += " - NdXxE";
                    }
                  }
                }

                let factors = isBetweenTwoNumbers(rightOfFirstD, 'x'); // check if 'x' is between two numbers
                let nSides = factors[0]; // number of sides on each dice
                let nExplode = factors[1]; // explosion factor 'e'
                let resultsUnderE = [];
                let resultsOverE = [];

                while (resultsUnderE.length < nDice) { // while the number of successfull rolls under 'e' is not equal to the number of dice to be rolled, keep rolling
                  let oneRoll = rollOneDi(nSides);
                  if (oneRoll >= nExplode) {
                    resultsOverE.push(oneRoll)
                  } else {
                    resultsUnderE.push(oneRoll)
                  }
                }

                let allResults = resultsUnderE.concat(resultsOverE); // put both arrays of results together

                return sumResults(allResults); // return a sum of the results
              } else {  // if the right of 'd' string contains neither a 'k', 'x', or 'd', return an error
                box.error = "Invalid Entry. Please see directions.";
                return "ERR";
              }
          }

        } else { // if 'd' is to the right of anything but a positive number
          box.error = "Invalid Entry. Please see directions.";
          return 'ERR';
        }

      } else {  // If 'd' is not in the string, return an error
        box.error = "Invalid Entry. Please see directions.";
        return 'ERR';
      }
    }
  }

  function finishRoll() { // returns the object to the client
    res.json(box);
  }

});

function isXAnyPositiveNumber(X) { // checks if what is given to it is a positive number, if so return it as a number, else return false
  if (Math.floor(Number(X)) == X){
    if (0 < X) {
      return Math.floor(Number(X));
    }
  }
  return false;
}

function rollOneDi(nSides) { // this randomly determines the result of rolling a di with the number of sides given
  let randomFactor = Math.random();
  let result = Math.floor(randomFactor*nSides)+1
  return result
}

function isBetweenTwoNumbers(string, letter) { // this checks if the letter given is sandwiched between two numbers in the string given
  let parts = string.split(letter);
  if (parts.length === 2 && isXAnyPositiveNumber(parts[0]) && isXAnyPositiveNumber(parts[1])) {
    return parts; // if so, return the two different numbers
  } else {
    return false;
  }
}

function sortResults(a,b) {
  return a-b;
}

function sumResults(results) { // this sums an array of numbers and returns the sum as a number
  let sum = 0;
  for (result of results) {
    sum += result;
  }
  return sum;
}

module.exports = router;
