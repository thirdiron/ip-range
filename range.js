
exports.range = function(spec) {
  var errors = [];
  var octets = spec.split(".");

  if(octets.length != 4) {
    errors.push("IP must contain 4 octets, contained: " + octets.length);
  }

  var parsedOctets = octets.map(function(octet, i) {
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

  
  return {
    valid: errors.length == 0,
    errors: errors,
    octets: parsedOctets,
    contains: function(specs) {
      var spec, specs, specOctets, i, j;
      if(!(specs instanceof Array)) {
        specs = Array.prototype.slice.call(arguments);
      }

      for(i = 0; i < specs.length; i++ ) {
        spec = specs[i];
        specOctets = exports.range(spec).octets;
        for(j = 0; j < 4; j++) {
          if(specOctets[j][0] < parsedOctets[j][0] || specOctets[j][1] > parsedOctets[j][1]) {
            return false;
          }
        }
        return true;
      }
    }
  };
}
