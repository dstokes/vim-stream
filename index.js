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
  0x2f: '/',
  0x3f: '?'
};

var INSERT = 0x1
  , NORMAL = 0x2
  , VISUAL = 0x3
  , COMMAND = 0x4;

module.exports = function(options) {
  var MODE = NORMAL
    , STATE = null
    , str = ''
    , cmd = '';
  options = (options || {});

  function write (buf) {
    // convert strings to buffers
    if (typeof buf === "string") buf = new Buffer(buf);

    for (var i = 0, l = buf.length; i < l; i++) {
      var c = buf[i];

      // escape
      if (c === 0x1b /* ESC */ ||
          c === 0x0d /* ENTER */ ||
          c === 0x3  /* CTRL-C */) {

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
          str = String.fromCharCode(c)
          cmd += str;
          this.queue(str);
        }
      }

      else if (MODE === NORMAL) {
        // discard invalid chars
        if (c >= 0x7e) continue;

        // meta-chars
        if (c < 0x20) {
          if (options.nometa !== true) {
            this.queue('^'+ String.fromCharCode(parseInt(c, 10) + 64));
          }
        } else {
          str = String.fromCharCode(c);
          if (inserts[c]) {
            MODE = INSERT;
          } else if (c === 0x3a /* : */ || c === 0x3b /* ; */)  {
            cmd += str;
            MODE = COMMAND;
          }
          this.queue(str);
        }
      }

      else if (MODE === VISUAL) {}
    }
  }

  function end () {}

  return through(write, end);
}
