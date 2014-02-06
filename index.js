var through = require('through');

/**
 * Queue all non-insert mode chars
 * Emit command groups and meta characters
 *
 *
 */

var inserts = {
  0x41: 'A',
  0x43: 'C',
  0x49: 'I',
  0x4f: 'O',
  0x61: 'a',
  0x63: 'c',
  0x69: 'i',
  0x6f: 'o',
  0x2f: '/',
  0x3f: '?'
};

var ctrl = {
  0x3: '^C',
  0x4: '^D',
  0x5: '^E',
  0x6: '^F',
  0xf: '^O',
  0x10: '^P',
  0x12: '^R',
  0x15: '^U',
  0x16: '^V',
  0x19: '^Y'
};

var INSERT = 0x1
  , NORMAL = 0x2
  , VISUAL = 0x3
  , COMMAND = 0x4
  // states
  , COUNT = 0x5
  ;

module.exports = function() {
  var MODE = NORMAL
    , STATE = null
    , cmd = '';

  function write (buf) {
    // convert strings to buffers
    if (typeof buf === "string") buf = new Buffer(buf);
    for (var i = 0, l = buf.length; i < l; i++) {
      var c = buf[i];

      // escape
      if (c === 0x1b /* ESC */ ||
          c === 0x0d /* ENTER */ ||
          c === 0x3 /* CTRL-C */) {

        if (MODE === COMMAND && c !== 0x1b) {
          this.emit('command', cmd);
          cmd = '';
        }
        MODE = NORMAL;
      }

      else if (MODE === COMMAND) {
        if (c === 0x8 /* BACKSPACE */) {
          cmd.slice(0, -1);
          // TODO: queue or emit
        } else {
          var str = String.fromCharCode(c)
          cmd += str;
          this.queue(str);
        }
      }

      else if (MODE === NORMAL) {
        // discard invalid chars
        //if (c >= 0x7e || c <= 0x1f) continue;

        // convert buff to string
        var str = ctrl[c] || String.fromCharCode(c);

        if (inserts[c]) {
          MODE = INSERT;
        } else if (c === 0x3a /* : */ || c === 0x3b /* ; */)  {
          cmd += str;
          MODE = COMMAND;
        }
        this.queue(str);
      }

      else if (MODE === VISUAL) {

      }
    }
  }

  function end () { }

  return through(write, end);
}
