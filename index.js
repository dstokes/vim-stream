var through = require('through');

var inserts = {
  0x41: 'A',
  0x43: 'C',
  0x49: 'I',
  0x4f: 'O',
  0x52: 'R',
  0x53: 'S',
  0x61: 'a',
  0x63: 'c',
  0x69: 'i',
  0x6f: 'o',
  //0x72: 'r',
  0x73: 's',
  0x2f: '/',
  0x3f: '?'
};

var INSERT = 0x1
  , NORMAL = 0x2
  , VISUAL = 0x3
  , COMMAND = 0x4;

var ESC = 0x1b
  , ENTER = 0x0d
  , CTRLC = 0x3;

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

      // meta-chars
      if (c < 0x20) {
        if (c === ESC || c === CTRLC) {
          MODE = NORMAL;
        } else if (c === ENTER) {
          if (MODE === INSERT) continue;
          if (MODE === COMMAND) {
            this.emit('command', cmd);
            cmd = '';
            MODE = NORMAL;
          }
        }

        if (options.noMeta !== true) {
          this.queue('^'+ String.fromCharCode(parseInt(c, 10) + 64));
        }
      }

      else if (MODE === COMMAND) {
        str = String.fromCharCode(c)
        cmd += str;
        this.queue(str);
      }

      else if (MODE === NORMAL) {
        // discard invalid chars
        if (c >= 0x7e) continue;

        str = String.fromCharCode(c);
        if (inserts[c]) {
          MODE = INSERT;
        } else if (c === 0x3a /* : */ || c === 0x3b /* ; */)  {
          cmd += str;
          MODE = COMMAND;
        } else if (c === 0x56 /* V */ || c === 0x76 /* v */ || c === 0x16 /* CTRLV */) {
          MODE = VISUAL;
        }

        this.queue(str);
      }

      else if (MODE === VISUAL) {
        if (inserts[c]) MODE = INSERT;
        this.queue(String.fromCharCode(c));
      }
    }
  }

  function end () {}

  return through(write, end);
}
