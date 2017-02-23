var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:roll', function(req, res, next) {
  let box = {
    'entry': '',
    'format': '',
    'total': 0
  }

  //This is the raw roll
  let roll  = req.params.roll;
  box.entry = roll;

  simpleTests();

  function simpleTests() {
    console.log('raw roll:', roll);
    // Check if its a literal value, if so just return it            d
    if (isXAnyPositiveNumber(roll)) {
      console.log(roll,"its a positive number with the length of",roll.length);
      console.log('returing literal d');
      box.format = 'd';
      box.total = Number(roll);
      finishRoll();
    } else { // If not, check if 'd' is in the string
      if (roll.indexOf('d') === 0) {  // 1) if 'd' is the first item in the string:
        console.log('d is the first letter in the string');
        box.format = 'dString'

        let rightOfFirstD = roll.substring(1,roll.length);
        console.log("right of first d:",rightOfFirstD);

        if (isXAnyPositiveNumber(rightOfFirstD)) { // 1a) if the only thing after it is a positive number (X):    dX
          box.format = 'dX';
          box.total = rollOneDi(Number(rightOfFirstD))
        } else {  // 1b) if the thing after it is not a positve number

        }
      } else if (roll.indexOf('d') > 0){ // If 'd' is not in the string, return an error
        console.log('d is NOT the first letter in the string');
        box.format = 'stringd'
      } else {
        console.log('d is NOT in the string');
        box.format = 'ERR';
        box.total = 'ERR';
      }
      finishRoll()
    }


      // 2) if 'd' is to the right of a positive number (N)
            // 2a) if the only thing to the right of 'd' is a positive number (X):    NdX
              // roll N dice with X sides, return total
            // 2b) if the only thing to the right of 'd' is a string containing 'k', 'x' or a second 'd':
                  // 2b1) if the string to the right of the first 'd' contains 'k', 'x' or a second 'd' sandwiched between two positive numbers:
                        //2b1a) if the middle letter in the second string is a 'k':
                          //
  }

  function isXAnyPositiveNumber(X) {
    if (Math.floor(Number(X)) == X){
      if (0 < X) {
        return Math.floor(Number(X));
      }
    }
    return false;
  }

  function finishRoll() {
    res.json(box);
  }

});

function rollOneDi(nSides) {
  console.log("rolling di with",nSides," sides");
  let randomFactor = Math.random();
  console.log("random factor:",randomFactor);
  let result = Math.floor(randomFactor*nSides)+1
  console.log("result:",result);
  return result
}

module.exports = router;
