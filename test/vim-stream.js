var test = require('tape')
  , stream = require('../')
  , through = require('through');

function buffer() {
  return through(function(b) { this.buf = (this.buf || '')+b; });
}

test('properly parses vim input', function(t) {
  var samples = [
    [':wqai\x0d', ':wqai'], // command
    ['VjI_\x1bvld\x16jI_', 'VjIvldjI'], // visual
    ['a_ A_ i_ I_ o_ O_ C_ a\x0d'.split(' ').join('\x1b'),'aAiIoOCa'] // insert
  ];

  t.plan(samples.length);
  while (samples.length) {
    var s = stream({ noMeta: true })
      , b = s.pipe(buffer())
      , sample = samples.shift();

    s.end(sample.shift());
    t.equal(b.buf, sample.shift());
  }
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

test('translates meta/ctrl characters', function(t) {
  var s = stream()
    , b = s.pipe(buffer());
  s.end('\x01\x08\x1a\x1d\x80kd');
  t.equal(b.buf, '^A^H^Z^]^H');
  t.end();
});
