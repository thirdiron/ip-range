ip-range
============

An IP range parser for JavaScript

Range Syntax
-------
IP ranges must contain exactly 4 fields, separated by periods. These fields may contain:

 * a number from 0 to 255
 * a wildcard (\*) character
 * an inclusive range of two numbers, separated by hyphen (eg 0-100)

Range Examples
---------

      192.168.1.10
      192.168.1.*
      192.168.1.1-100
      192.168.1-10.*
      190-193.168.1.*


Usage
--------

    var ip = require('ip-range')

    ip.range('192.168.0.*').valid //true
    ip.range('a.0.0.1').errors //[error in octet 1, invalid octet spec: 'a']
    ip.range('10.0.0.1-10').contains('10.0.0.3', '10.0.0.10') //true
    ip.range('10.0.0.1-10', '10.0.0.20-30').contains('10.0.0.3', '10.0.0.10', '10.0.0.25') //true
  
