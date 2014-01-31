var through = require('through');

var inserts = [
  0x41, /* a */
  0x43, /* c */
  0x49, /* i */
  0x4f, /* o */
  0x61, /* A */
  0x63, /* C */
  0x69, /* I */
  0x6f  /* O */
];

module.exports = function() {
  var insert = false;

  function write(buf) {
    var leftInsert = 0;
    for (var i = 0, l = buf.length; i < l; i++) {
      var idx = inserts.indexOf(buf[i]);

      // switched to insert mode
      if (idx >= 0 && idx < 5) {
        insert = true;
      }

      // escape
      else if (buf[i] === 0x1B) {
        insert = false;
      }

      else if (insert === false) {
        var end = i+1;
        if (idx !== -1) {
          insert = true;
          if (buf[i] === 0x43) end++;
        }
        this.queue(buf.toString('utf8', i, end));
      }
    }
  }

  function end() {}

  return through(write, end);
}
