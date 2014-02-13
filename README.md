vim-stream
==========
A through stream that filters and parses vim keystrokes

[![Build Status](https://travis-ci.org/dstokes/vim-stream.png)](https://travis-ci.org/dstokes/vim-stream)  
[![NPM](https://nodei.co/npm/vim-stream.png?downloads=true)](https://nodei.co/npm/vim-stream/)  

This module is highly experimental.

example
=======
``` shell
  echo "ifoo bar\x1b:wq" | vim-stream --noMeta
  i:wq
```

setup
=====
Track vim keystrokes by creating an alias that uses the `scriptout` flag:

``` shell
  alias vim="vim -w ~/.vimlog"
```

This will write keystrokes to the supplied file when vim is closed.

options
=======

### noMeta
Exclude meta characters from output.

install
=======
With [npm](http://npmjs.org) do:

```
npm install vim-stream
```
