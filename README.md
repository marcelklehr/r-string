# r-string

A commutative and conflic-free replicated string. This is a [Scuttlebutt](https://github.com/dominictarr/scuttlebutt).

## Example
```js
var RString = require('r-string')

var textarea1 = document.createElement('textarea')
document.body.appendChild(textarea1)

var textarea2 = document.createElement('textarea')
document.body.appendChild(textarea2)

var r1 = RString().wrapTextinput(textarea1)
var r2 = RString().wrapTextinput(textarea2)

var stream = r1.createStream()
stream.pipe(r2.createStream()).pipe(stream)
```

## Legal
(c) 2015 by Marcel Klehr  
MIT License