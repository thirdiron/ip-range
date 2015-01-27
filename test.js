var assert = require('assert');
var ip = require('./');


var range = ip.range('192.168.0.1');

assert(range.valid, range.errors);
assert(range.contains('192.168.0.1'));
assert(!range.contains('192.168.0.0'));

assert.equal(ip.range("1.2.3").errors, "IP must contain 4 octets, contained: 3");
assert.equal(ip.range("1.2.3.a").errors, "error in octet 4, invalid octet spec: 'a'");
assert.equal(ip.range("1.2.3.266").errors, "error in octet 4, octet range out of bounds: '266'");


assert(ip.range('1.*.0.*').contains('1.2.0.10'));
assert(!ip.range('1.0.1.*').contains('1.0.0.10'));
assert(ip.range('1.2.3.4-10').contains('1.2.3.4', '1.2.3.10'));
assert(ip.range('1.2.3.5', '1.2.3.4').contains('1.2.3.4', '1.2.3.5'));

// Must add tests for inetAddresses property!
assert(false);

