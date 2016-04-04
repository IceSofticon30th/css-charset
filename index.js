var iconv = require('iconv-lite');
var charset = require('charset');
var util = require('util');
var Transform = require('stream').Transform;

var IN_CHARSET = 1;
var IN_WHITE = 2;
var IN_QUOTE = 3;
var IN_CHARSET_VALUE = 4;
var CHARSET_FOUND = 5;
var CONVERTING = 6;
var PASSINGTHROUGH = 7;

util.inherits(CSSCharset, Transform);

module.exports = CSSCharset;

function CSSCharset(responseHeader) {
    if (!(this instanceof CSSCharset)) return new CSSCharset(responseHeader);
    
    var encoding = charset(responseHeader);
    
    Transform.call(this);
    
    this._defaultCharset = encoding;
    this._bufferArray = [];
    this._state = IN_CHARSET;
    this._charsetStartIndex = 0;
    this._charsetEndIndex = 0;
    this._quoteType = null;
    this._index = 0;
    this._charset = null;
    this._converter = null;
    
    this.resume();
        
}

CSSCharset.prototype._transform = function (chunk, encoding, callback) {
    var self = this;
    var buffer = null;
    
    if (this._state <= CHARSET_FOUND) {
        this._bufferArray.push(chunk);
        buffer = Buffer.concat(this._bufferArray);
    }
    
    if (this._state === IN_CHARSET && buffer.length >= 8) {
        var charsetString = buffer.slice(0, 8).toString();
        if (charsetString.toLowerCase() == '@charset') {
            this._state = IN_WHITE;
            this._index = 8;
        } else {
            this._state = PASSINGTHROUGH;
        }
    }
    
    if (this._state === IN_WHITE) {
        for (; this._index < buffer.length; this._index++) {
            var character = buffer[this._index];
            if ( character === '"'.charCodeAt(0) || character === "'".charCodeAt(0) ) {
                this._state = IN_CHARSET_VALUE;
                this._quoteType = character;
                this._charsetStartIndex = this._index + 1;
                this._index += 1;
                break;
            }
        }
    }
    
    if (this._state === IN_CHARSET_VALUE) {
        for (; this._index < buffer.length; this._index++) {
            var character = buffer[this._index];
            if (character === this._quoteType) {
                this._charsetEndIndex = this._index;
                this._state = CHARSET_FOUND;
                break;
            }
        }
    }
    
    if (this._state === CHARSET_FOUND) {
        var _charset = buffer.slice(this._charsetStartIndex, this._charsetEndIndex).toString().toLowerCase() || this._defaultCharset;
        this._charset = _charset;
        if (!_charset || _charset === 'utf8' || _charset === 'utf-8') {
            this.push(buffer);
            this._state = PASSINGTHROUGH;
            callback();
            return;            
        } else {
            var converter = iconv.decodeStream(this._charset);
            converter.on('data', function (data) { self.push(data); });
            converter.write('@charset "UTF-8"');
            converter.write(buffer.slice(this._charsetEndIndex + 1, buffer.length));
            this._converter = converter;
            this._state = CONVERTING;
            callback();
            return;
        }
    }
    
    if (this._state === CONVERTING) {
        this._converter.write(chunk);
    }
    
    if (this._state === PASSINGTHROUGH) {
        this.push(chunk);
    }
    
    callback();
}

CSSCharset.prototype._flush = function (callback) {
    var buffer = Buffer.concat(this._bufferArray);
    if (buffer.length < 8) this.push(buffer);
    callback();
}

function isWhiteSpace(str) {
    if (str === ' ') return true;
    if (str === '\t') return true;
    return false;
}