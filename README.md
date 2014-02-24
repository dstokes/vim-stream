vim-stream
==========
A through stream that filters and parses vim keystrokes

[![Build Status](https://travis-ci.org/dstokes/vim-stream.png)](https://travis-ci.org/dstokes/vim-stream)  
[![NPM](https://nodei.co/npm/vim-stream.png?downloads=true)](https://nodei.co/npm/vim-stream/)  

This module is highly experimental.

example
=======
Simple parsing:

``` shell
  echo "ifoo bar\x1b:wq" | vim-stream --noMeta
  i:wq
```

Quick frequency stats:

``` shell
  cat ~/.vimlog | vim-stream --noMeta | \
    sed -e 's/\(.\)/\1\'$'\n/g' | sort | uniq -c | sort -nr
  2835 k
  2827 j
  1307 l
   821 h
   152 w
   136 :
   114 d
   ...
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
