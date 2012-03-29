require('ember-validators/validators/validator');

var get = Ember.get;

Ember.Validator.CreditCard = Ember.Validator.extend({

  validate: function(form, field) {
    return this.checkNumber(get(field, 'value'));
  },

  /**
    Allow only numbers, dashes, and spaces
  */
  validateKeyDown: function(form, field, charStr) {
    return !!charStr.match(/[0-9\- ]/);
  },

  checkNumber: function(ccNumb) {
    if (!ccNumb || ccNumb.length === 0) { return true; } // do not validate empty

    // remove any spaces or dashes
    ccNumb = ccNumb.replace(/[^0-9]/g, '');

    var valid = "0123456789",  // Valid digits in a credit card number
        len = ccNumb.length,  // The length of the submitted cc number
        iCCN = parseInt(ccNumb,0),  // integer of ccNumb
        sCCN = ccNumb.toString().replace(/^\s+|\s+$/g,''),  // string of ccNumb // strip spaces
        iTotal = 0,  // integer total set at zero
        bNum = true,  // by default assume it is a number
        bResult = false,  // by default assume it is NOT a valid cc
        temp,  // temp variable for parsing string
        calc,  // used for calculation of each digit
        j, i;

    // Determine if the ccNumb is in fact all numbers
    for (j=0; j<len; j++) {
      temp = '' + sCCN.substring(j, j+1);
      if (valid.indexOf(temp) === -1) { bNum = false; }
    }

    // if it is NOT a number, you can either alert to the fact,
    // or just pass a failure
    if(!bNum) { bResult = false; }

    // Determine if it is the proper length
    if ((len === 0) && (bResult)) {  // nothing, field is blank AND passed above # check
      bResult = false;
    } else {  // ccNumb is a number and the proper length - let's see if it is a valid card number
      if (len >= 15) {  // 15 or 16 for Amex or V/MC
        for (i=len;i>0;i--) {  // LOOP through the digits of the card
          calc = parseInt(iCCN,0) % 10;  // right most digit
          calc = parseInt(calc,0);  // assure it is an integer
          iTotal += calc;  // running total of the card number as we loop - Do Nothing to first digit
          i--;  // decrement the count - move to the next digit in the card
          iCCN = iCCN / 10;                               // subtracts right most digit from ccNumb
          calc = parseInt(iCCN,0) % 10 ;    // NEXT right most digit
          calc = calc *2;                                 // multiply the digit by two
          // Instead of some screwy method of converting 16 to a string and then parsing 1 and 6 and then adding them to make 7,
          // I use a simple switch statement to change the value of calc2 to 7 if 16 is the multiple.
          switch(calc) {
            case 10: calc = 1; break;       //5*2=10 & 1+0 = 1
            case 12: calc = 3; break;       //6*2=12 & 1+2 = 3
            case 14: calc = 5; break;       //7*2=14 & 1+4 = 5
            case 16: calc = 7; break;       //8*2=16 & 1+6 = 7
            case 18: calc = 9; break;       //9*2=18 & 1+8 = 9
            default: calc = calc;           //4*2= 8 &   8 = 8  -same for all lower numbers
          }
          iCCN = iCCN / 10;  // subtracts right most digit from ccNum
          iTotal += calc;  // running total of the card number as we loop
        }  // END OF LOOP
        if ((iTotal%10) === 0) {  // check to see if the sum Mod 10 is zero
          bResult = true;  // This IS (or could be) a valid credit card number.
        } else {
          bResult = false;  // This could NOT be a valid credit card number
        }
      }
    }
    return bResult; // Return the results
  }

});
