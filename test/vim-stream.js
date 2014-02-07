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
  var pieces = ['ab', 'Ab', 'ij', 'Ij', 'op', 'Op', 'Cd'];
  s.end(pieces.join('\x1b'));
  t.equal(b.buf, 'aAiIoOC');
  t.end();
});

test('groups command mode keystrokes', function(t) {
  t.plan(2);

  var s = stream();
  s.once('command', function(keys) {
    t.equal(keys, ':wqa');
  });
  s.write('j:wqa\x0dj');

  s.once('command', function(keys) {
    t.equal(keys, ':%s/foo/bar/');
  });
  s.end('j:%s/foo/bar/\x0d');
});
