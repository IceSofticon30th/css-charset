var CSSCharset = require('./index.js');

var converter = CSSCharset('');
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

function file() {
    require('fs').createReadStream('./sample.css').pipe(converter);
}

text();