var through = require('through');

var inserts = {
  0x41: 'A',
  0x43: 'C',
  0x49: 'I',
  0x4f: 'O',
  0x61: 'a',
  0x63: 'c',
  0x69: 'i',
  0x6f: 'o'
};

var ctrl = {
  0x4: '^d',
  0x5: '^e',
  0x6: '^f',
  0xf: '^o',
  0x10: '^p',
  0x12: '^r',
  0x15: '^u',
  0x16: '^v',
  0x19: '^y'
};

module.exports = function() {
  var insert = false;

  function write(buf) {
    var leftInsert = 0;
    for (var i = 0, l = buf.length; i < l; i++) {
      // switched to insert mode
      if (inserts[buf[i]]) {
        insert = true;
        this.queue(String.fromCharCode(buf[i]) +"\n");
      }

      // escape
      else if (buf[i] === 0x1B) {
        insert = false;
      }

      else if (insert === false) {
        // var end = i+1;
        // this.queue(buf.toString('utf8', i, end));
        if (buf[i] === 0x20) return;
        if (ctrl[buf[i]]) {
          this.queue(ctrl[buf[i]]);
        } else {
          this.queue(String.fromCharCode(buf[i]));
        }
      }
    }
  }

  function end() {}

  return through(write, end);
}
