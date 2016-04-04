# css-charset
A TransformStream that detects charset from http client response and CSS body, and converts to utf-8.

# Usage
```js
var CSSCharset = require('css-charset');
var converter = CSSCharset(res.headers);
```
### CSSCharset(responseHeader)
* responseHeader {Object | String} Client response. this will be passed to `charset` module.  

Returns a new TransformStream that detects charset from http client response and chunked CSS content, finally converts CSS content to UTF-8 strings Buffers. First, it stores CSS contents Buffers and detects charset strings. Then, it converts CSS contents to UTF-8 strings Buffers. At this time, the charset strings `@charset [charset-strings]` is replaced to `@charset "UTF-8"`. Finally, you can get UTF-8 CSS strings Buffers stream. If the charset couldn't be detected, this stream passes CSS contents with no modification.

# Example
```js
var CSSCharset = require('css-charset');

var converter = CSSCharset(res.headers);
converter.on('data', function (data) {
    console.log('convert', data.toString());
});

function write(str) {
    console.log('write', str);
    converter.write(str);
}

function text() {
    write('@char');
    write('set');
    write('\t  \t');
    write("'");
    write('Shi');
    write('f');
    write('t_JI');
    write("S'; body { background: red; }");
}

text();
<pre>
write set
write 	  	
write '
write Shi
write f
write t_JI
write S'; body { background: red; }
convert @charset "UTF-8"
convert ; body { background: red; }
</pre>
`converter` receives string/Buffer contents, detects charset, converts contents to UTF-8 Buffers, replaces `@charset [charset-strings]` to `@charset "UTF-8"`.