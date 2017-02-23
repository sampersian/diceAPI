else {  // if the only thing to the right of 'd' is not a number
  box.format = "Ndstring"

  if (rightOfFirstD.indexOf('k') > 0) { // if the right of 'd' string contains a 'k' that isn't the first character
    console.log("there is a Nd with a 'k'");
    box.format = "Ndstringwithk";
    if (isBetweenTwoNumbers(rightOfFirstD, 'k')) {
      console.log(isBetweenTwoNumbers(rightOfFirstD, 'k'));
      box.format = "NdXkK";
      box.type = "Keep highest rolls";
    } else {
      console.log("there is a k but its not between two numbers");
    }

  }
  else if (rightOfFirstD.indexOf('x') > 0) { // if the right of 'd'string contains an 'x'
    console.log("there is a Nd with a 'x'");
    box.format = "Ndstringwithx";

    if (isBetweenTwoNumbers(rightOfFirstD, 'x')) {
      console.log(isBetweenTwoNumbers(rightOfFirstD, 'x'));
      box.format = "NdXxE";
      box.type = "Explosive roll";
    } else {
      console.log("there is a x but its not between two numbers");
    }
  }
  else if (rightOfFirstD.indexOf('d') > 0) {  // if the right of 'd'string contains a 'd':
    console.log("there is a Nd with a 'd'");
    box.format = "Ndstringwithd";

    if (isBetweenTwoNumbers(rightOfFirstD, 'd')) {
      console.log(isBetweenTwoNumbers(rightOfFirstD, 'd'));
      box.format = "NdXdD";
      box.type = "Drop lowest rolls"
    } else {
      console.log("there is a d but its not between two numbers");
    }
  }
  else {  // if the right of 'd' string contains neither a 'k', 'x', or 'd', return an error
    console.error("there is a Nd without a k x or d.  ERROR");
    box.format = "ERR";
    box.total = "ERR";
  }

}
