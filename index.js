var through = require('through');

var inserts = {
  0x41: 'A',
  0x43: 'C',
  0x49: 'I',
  0x4f: 'O',
  0x61: 'a',
  0x63: 'c',
  0x69: 'i',
  0x6f: 'o',
  0x2f: '/'
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

var INSERT = 0x1
  , NORMAL = 0x2
  , VISUAL = 0x3
  , COMMAND = 0x4;

module.exports = function() {
  var MODE = NORMAL;

  function write(buf) {
    for (var i = 0, l = buf.length; i < l; i++) {
      // switched to insert MODE
      if (inserts[buf[i]] && MODE !== COMMAND) {
        MODE = INSERT;
        this.queue(String.fromCharCode(buf[i]) +"\n");
      }

      // escape
      else if (buf[i] === 0x1B /* ESC */ ||
               buf[i] === 0x0d /* ENTER */) {
        MODE = NORMAL;
      }

      else if (MODE !== INSERT) {
        if (buf[i] === 0x20 /* SPACE */) continue;
        if (ctrl[buf[i]]) {
          this.queue(ctrl[buf[i]]);
        } else {
          if (buf[i] === 0x3a /* : */ ||
              buf[i] === 0x3b /* ; */)  {
            MODE = COMMAND;
          }
          // discard invalid chars
          if (buf[i] >= 0x7e || buf[i] <= 0x1f) {
            continue;
          }
          this.queue(String.fromCharCode(buf[i]));
        }
      }
    }
  }

  function end() {}

  return through(write, end);
}
