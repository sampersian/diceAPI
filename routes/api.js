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
  box.entry = raw_expression;

  let split_plusses = raw_expression.split("+");
  console.log(split_plusses);

  let split_minuses = raw_expression.split("-");
  console.log(split_minuses);

  if (split_plusses.length === 2 && split_minuses.length === 1) { // if two expressions are being added
    box.type = "Addition";
    console.log('there is/are ',split_plusses.length-1,'plus sign(s)');
    console.log('expression1:', split_plusses[0]);
    console.log('expression2:', split_plusses[1]);
    let expression1Total = evaluateExpression(split_plusses[0]);
    console.log('expression 1 total:', expression1Total);
    let expression2Total = evaluateExpression(split_plusses[1]);
    console.log('expression 2 total:', expression2Total);
    if (typeof expression1Total === 'number' || typeof expression2Total === 'number') {
      box.total = expression1Total + expression2Total;
    } else {
      box.total = "ERR";
    }
    finishRoll();
  } else if (split_plusses.length === 1 && split_minuses.length === 2) { // if an expression is being subtracted from abother
    box.type = "Subtraction"
    console.log('there is no plus sign and there is/are ',split_minuses.length-1,'minus signs');
    console.log('there is/are ',split_minuses.length-1,'plus sign(s)');
    console.log('expression1:', split_minuses[0]);
    console.log('expression2:', split_minuses[1]);
    let expression1Total = evaluateExpression(split_minuses[0]);
    console.log('expression 1 total:', expression1Total);
    let expression2Total = evaluateExpression(split_minuses[1]);
    console.log('expression 2 total:', expression2Total);
    if (typeof expression1Total === 'number' || typeof expression2Total === 'number') {
      box.total = expression1Total - expression2Total;
    } else {
      box.error = "Invalid Entry. Please see directions.";
    }
    finishRoll();
  } else if (split_plusses.length === 1 && split_minuses.length === 1) { // if just one expression is being given
    console.log("a single expression was given");
    box.total = evaluateExpression(raw_expression);
    finishRoll();
  } else {
    console.log("more than two expressions are trying to be added/subtracted. not currently supported.");
    box.total = 'ERR';
    box.error = "The adding/subtracting of more than two expressions is not currently supported.";
    finishRoll();
  }

  function evaluateExpression(expression) {
    console.log('raw expression:', expression);

    if (isXAnyPositiveNumber(expression)) {  // Check if its a literal value, if so just return it            d
      console.log(expression,"its a positive number with the length of",expression.length);
      console.log('returing literal d');

      if (box.type === '') {
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
      return Number(expression);
    }
    else {

      if (expression.indexOf('d') === 0) {  // if 'd' is the first item in the string:
        console.log('d is the first letter in the string');

        let rightOfFirstD = expression.substring(1,expression.length);
        console.log("right of first d:",rightOfFirstD);

        if (isXAnyPositiveNumber(rightOfFirstD)) { // ... and if the only thing after it is a positive number (X):    dX

          if (box.type === '') {
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


          return rollOneDi(Number(rightOfFirstD))
        }
        else {  // ... or if the thing after it is not a positve number, return an error
          box.error = "Invalid Entry. Please see directions.";
          return "ERR"
        }

      }
      else if (expression.indexOf('d') > 0){ // if 'd' is in the string, but is not the first letter
        console.log('d is NOT the first character in the string, but it is in the string');

        let leftOfFirstD = expression.substring(0,expression.indexOf('d'));
        console.log('left of first d:',leftOfFirstD);

        if (isXAnyPositiveNumber(leftOfFirstD)) {   // if 'd' is to the right of a positive number (N)
          let nDice = leftOfFirstD;

          let rightOfFirstD = expression.substring(expression.indexOf('d')+1,expression.length);
          console.log("right of first d:",rightOfFirstD);

          if (isXAnyPositiveNumber(rightOfFirstD)) { //if the only thing to the right of 'd' is a positive number (X):    NdX
              console.log("rolling ",leftOfFirstD," dice, each with",rightOfFirstD,"sides");

              if (box.type === '') {
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

              let numberOfSides = rightOfFirstD;
              let diNumber = 1;

              while (diNumber <= nDice) { // roll N dice with X sides
                //console.log('roll #', diNumber);
                tempTotal += rollOneDi(numberOfSides);
                diNumber += 1;
              }
              return tempTotal;
          }

          else {  // if the only thing to the right of 'd' is not a number
              if (isBetweenTwoNumbers(rightOfFirstD, 'k')) { // if the thing the the right of the 'd' is a string containting a 'k' surrounded by two numbers
                console.log("there is a k in the string to the right of the d surrounded by two numbers");

                if (box.type === '') {
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

                console.log('sum of results to keep:', sumResults(resultsToKeep));
                return sumResults(resultsToKeep);

              } else if (isBetweenTwoNumbers(rightOfFirstD, 'd')) { // if the thing the the right of the 'd' is a string containting a second 'd' surrounded by two numbers
                console.log("there is a d in the string to the right of the first d surrounded by two numbers");

                if (box.type === '') {
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

                console.log('sum of results to keep:', sumResults(resultsToKeep));
                return sumResults(resultsToKeep);

              }
              else if (isBetweenTwoNumbers(rightOfFirstD, 'x')) { // if the thing the the right of the 'd' is a string containting a 'x' surrounded by two numbers
                console.log("there is a x in the string to the right of the d surrounded by two numbers");

                if (box.type === '') {
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

                console.log('sum of all results: ',sumResults(allResults));
                return sumResults(allResults);


              } else {  // if the right of 'd' string contains neither a 'k', 'x', or 'd', return an error
                console.log("there is not a k, x, or d in the string to the right of the d");
                box.error = "Invalid Entry. Please see directions.";
                return "ERR";
              }
          }

        } else { // if 'd' is to the right of anything but a positive number
          console.log('thing before first "d" is not a positive number');
          box.error = "Invalid Entry. Please see directions.";
          return 'ERR';
        }

      } else {  // If 'd' is not in the string, return an error
        console.log('d is NOT in the string');
        box.error = "Invalid Entry. Please see directions.";
        return 'ERR';
      }
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
