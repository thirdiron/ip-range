var ipCalc = require('ip-subnet-calculator');

/**
 * returns a function which will apply a list of args to the
 * given function as if they were passed as an array
 **/
function varArgs(fn) {
  return function(args) {
    if(!(args instanceof Array)) {
      args = Array.prototype.slice.call(arguments);
    }
    return fn(args);
  };
}

function mapCalculatorResponseToCIDRNotation(maskObj) {
  return maskObj.ipLowStr + '/' + maskObj.prefixSize.toString();
}

exports.range = varArgs(function(specs) {
  var errors = [];
  var parsedSpecs = specs.map(function(spec) {
    var octets = spec.split(".");

    if(octets.length != 4) {
      errors.push("IP must contain 4 octets, contained: " + octets.length);
    } else {
        if(octets[0].indexOf('-') != -1 || octets[1].indexOf('-') != -1) {
          errors.push("Hyphenated values not allowed in first or second octet. ");
        }

        if(octets[0].indexOf('*') != -1 || octets[1].indexOf('*') != -1) {
          errors.push("Wildcards are not allowed in the first or second octet. ");
        }
    }

    return octets.map(function(octet, i) {
      var match;
      if(octet == "*") {
        return [0, 255];
      } else if(match = /(\d+)\-?(\d*)/.exec(octet)) {
        var lowValue = parseInt(match[1], 10),
            highValue = match[2] ? parseInt(match[2], 10) : lowValue;

        (lowValue == highValue? [lowValue] : [lowValue, highValue]).forEach(function(value) {
          if(value > 255) {
            errors.push("error in octet " + (i +1) + ", octet range out of bounds: '" + value + "'");
          }
        });
        return [lowValue, highValue];
      } else {
        errors.push("error in octet " + (i +1) + ", invalid octet spec: '" + octet + "'");
      }
    });
  });

  var inetAddresses = [];
  var fromAddress, toAddress, masks;
  if (errors.length === 0) {
    parsedSpecs.forEach(function(parsedSpec) {
      var prefix = parsedSpec[0][0].toString() + '.' + parsedSpec[1][0] + '.';
       // * in the 4th octet, any variation in the third results in a contiguous block of IPs
      if (parsedSpec[3][0] === 0 && parsedSpec[3][1] === 255) {
        fromAddress = prefix + parsedSpec[2][0].toString() + '.0';
        toAddress = prefix + parsedSpec[2][1].toString() + '.255';
        checkSubnetMask(fromAddress, toAddress);
      } else {
        // Otherwise we need to treat each value within the range of the 3rd octet as its
        // own range represented by its own set of inet address/mask combinations
        for (var j=parsedSpec[2][0];j<=parsedSpec[2][1];j++) {
          fromAddress = prefix + j + '.' + parsedSpec[3][0];
          toAddress = prefix + j + '.' + parsedSpec[3][1];
          masks = ipCalc.calculate(fromAddress, toAddress);
          checkSubnetMask(fromAddress, toAddress);
        }
      }
    });

    function checkSubnetMask(fromAddress, toAddress) {
      masks = ipCalc.calculate(fromAddress, toAddress);
      if (masks) {
        Array.prototype.push.apply(inetAddresses, masks.map(mapCalculatorResponseToCIDRNotation))
      } else { // ip-subnet-calculator returns null if error found
        errors.push("Internal error in ip-subnet-calculator for ip range value: " + specs);
      }
    }

  }
  return {
    valid: errors.length === 0,
    errors: errors,
    entries: parsedSpecs,
    inetAddresses: inetAddresses,
    contains: varArgs(function(specs) {
      if(errors.length) {
        return false;
      }
      var range = exports.range(specs),
          specOctets, parsedOctets, found, i, j, k;
      for(i = 0; i < range.entries.length; i++) {
        specOctets = range.entries[i];
        found = false;
        for(j = 0; j < parsedSpecs.length; j++) {
          parsedOctets = parsedSpecs[j];
          var matches = true;
          for(k = 0; k < 4; k++) {
            if(specOctets[k][0] < parsedOctets[k][0] || specOctets[k][1] > parsedOctets[k][1]) {
              matches = false;
              break;
            }
          }
          if(matches) {
            found = true;
          }
        }
        if(!found) {
          return false;
        }
      }
      return true;
    })
  };
});
