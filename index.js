/*!
 * r-string
 * Copyright 2015 by Marcel Klehr <mklehr@gmx.net>
 *
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var RArray   = require('r-array')
var inherits = require('util').inherits

module.exports = RString

inherits(RString, RArray)

function RString() {
  if(!(this instanceof RString)) return new RString()
  RArray.call(this)
}

var R = RString.prototype

R.text  = function text () {
  return this.toJSON().join('')
}

R.insertChar = function(at, char) {
  this.splice(at, 0, char)
}

R.insertString = function(at, str) {
  // insert backwards char-by-char
  for(var i=str.length-1; i>=0; i--) {
    this.insertChar(at, str[i])
  }
}

R.remove = function(at, length) {
  this.splice(at, length)
}

R.setText = function(newval) {
  var oldval = this.text()

  // The following code is taken from shareJS:
  // https://github.com/share/ShareJS/blob/3843b26831ecb781344fb9beb1005cfdd2/lib/client/textarea.js

  if (oldval === newval) return;

  var commonStart = 0;
  while (oldval.charAt(commonStart) === newval.charAt(commonStart)) {
    commonStart++;
  }
  var commonEnd = 0;
  while (oldval.charAt(oldval.length - 1 - commonEnd) === newval.charAt(newval.length - 1 - commonEnd) &&
    commonEnd + commonStart < oldval.length && commonEnd + commonStart < newval.length) {
    commonEnd++;
  }
  if (oldval.length !== commonStart + commonEnd) {
    this.remove(commonStart, oldval.length - commonStart - commonEnd);
  }
  if (newval.length !== commonStart + commonEnd) {
    this.insertString(commonStart, newval.slice(commonStart, newval.length - commonEnd));
  }
}

R.wrapTextinput = function(textarea) {
  var rstring = this
  
  // Set current value
  textarea.value = rstring.text()
  
  var start
    , end

  this.on('preupdate', onPreupdate)
  this.on('_update'  , on_update)

  // Update text on events

  var eventNames = ['textInput', /*'keydown',*/ 'keyup', 'cut', 'paste', 'drop', 'dragend'];
  for (var i = 0; i < eventNames.length; i++) {
    var e = eventNames[i];
    if (textarea.addEventListener) {
      textarea.addEventListener(e, genOp, false);
    } else {
      textarea.attachEvent('on' + e, genOp);
    }
  }
  
  function onPreupdate (ch) {
  
    //force update when recieve message.
    var cursorStart = 0, cursorEnd = 0

    start = textarea.selectionStart
    end   = textarea.selectionEnd
    
    //what atom contains the cursor?
    var startKey =rstring.keys[start]
      , endKey = rstring.keys[end]
    
    //how much will be inserted into the document?
    for(var key in ch) {
      if(key < startKey) {
        if(ch[key]) cursorStart++
        else cursorStart--
      }
      if(key < endKey) {
        if(ch[key]) cursorEnd++
        else cursorEnd--
      }
    }
    //THIS IS ACTUALLY WRONG. CAN'T insert into a selection!
    start = start + cursorStart
    end   = end   + cursorEnd
  }

  function on_update (update) {
    if(update[2] !== rstring.id) {
      // set value
      oldval = textarea.value = rstring.text()
      
      // fix selection
      textarea.selectionStart = start
      textarea.selectionEnd   = end
      
      //textarea.dispatchEvent(new window.Event('input')) // XXX: What for?
    }
  }

  function genOp(evt) {
    rstring.setText(textarea.value)
  }
  
  return this
}

