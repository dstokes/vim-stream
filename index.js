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
  , CTRLC = 0x3
  , SPACE = 0x20;

function isMeta(ch) { return ch < SPACE; }

// convert hex to string, map meta to ^[char]
function toChar(ch) {
  if (typeof ch === 'string') return ch;
  return isMeta(ch) ?
    '^'+ String.fromCharCode(parseInt(ch, 10) + 64) :
    String.fromCharCode(ch);
}

module.exports = function(options) {
  var MODE = NORMAL
    , str = ''
    , cmd = ''
    , stack = []
    , stream = through(write, end);
  options = (options || {});

  function queue (ch) {
    if (isMeta(ch) && options.noMeta) return;
    stream.queue(toChar(ch));
  }

  function write (buf) {
    // convert strings to buffers
    if (typeof buf === "string") buf = new Buffer(buf);

    for (var i = 0, l = buf.length; i < l; i++) {
      var c = buf[i];

      // meta-chars
      if (isMeta(c)) {
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
        queue(c);
      }

      else if (MODE === INSERT) {
        continue;
      }

      // account for special vim backspace code (<80>kb)
      else if (c === 0x80 && MODE !== INSERT) {
        i += 2;
        queue(0x8);
      }

      else if (MODE === COMMAND) {
        str = toChar(c)
        cmd += str;
        queue(c);
      }

      else if (MODE === NORMAL) {
        // discard invalid chars
        if (c >= 0x7e) continue;

        if (inserts[c]) {
          MODE = INSERT;
        } else if (c === 0x3a /* : */ || c === 0x3b /* ; */)  {
          cmd += toChar(c);
          MODE = COMMAND;
        } else if (c === 0x56 /* V */ || c === 0x76 /* v */ || c === 0x16 /* CTRLV */) {
          MODE = VISUAL;
        }

        queue(c);
      }

      else if (MODE === VISUAL) {
        if (inserts[c]) MODE = INSERT;
        queue(c);
      }
    }
  }

  function end () {}

  return stream;
}
