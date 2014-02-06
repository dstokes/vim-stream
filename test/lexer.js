var test = require('tape')
  , stream = require('../')
  , through = require('through');

function buffer() {
  return through(function(b) { this.buf = (this.buf || '')+b; });
}

test('ignores insert mode text', function(t) {
  var s = stream()
    , b = buffer();
  s.pipe(b);
  s.write('jifoo\x1bk');
  s.end();
  t.equal(b.buf, 'jik');
  t.end()
});
