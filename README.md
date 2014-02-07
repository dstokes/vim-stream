vim-stream
==========
A through stream that filters and parses vim keystrokes

[![Build Status](https://travis-ci.org/dstokes/vim-stream.png)](https://travis-ci.org/dstokes/vim-stream)

This module is highly experimental. Protect yourself.

example
=======
``` shell
  cat ~/.vimlog | vim-stream > keystrokes.log
```

To be more succinct:
``` shell
  echo "ifoo bar\x1b:wq" | vim-stream
  i:wq
```

setup
=====
Track vim keystrokes by creating an alias that uses the `scriptout` flag:

``` shell
  alias vim="vim -w ~/.vimlog"
```

This will write keystrokes to the supplied file when vim is closed.

install
=======
With [npm](http://npmjs.org) do:

```
npm install vim-stream
```
