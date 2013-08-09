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
  }
}

exports.range = varArgs(function(specs) {
  var errors = [];
  var parsedSpecs = specs.map(function(spec) {
    var octets = spec.split(".");

    if(octets.length != 4) {
      errors.push("IP must contain 4 octets, contained: " + octets.length);
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

  
  return {
    valid: errors.length == 0,
    errors: errors,
    entries: parsedSpecs,
    contains: varArgs(function(specs) {
      if(errors.length) {
        return false;
      }
      var range = exports.range(specs),
          specOctets, parsedOctets, found, i, j, k;
      for(i = 0; i < range.entries.length; i++) {
        var specOctets = range.entries[i];
        var found = false;
        for(j = 0; j < parsedSpecs.length; j++) {
          var parsedOctets = parsedSpecs[j];
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
