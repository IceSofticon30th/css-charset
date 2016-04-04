var CSSCharset = require('./index.js');

var converter = CSSCharset('');
converter.on('data', function (data) {
    console.log(data.toString());
});

function text() {
    write('@char');
    write('set');
    write('\t  \t');
    write("'");
    write('Shi');
    write('f');
    write('t_JI');
    write('S');
    write("'");
    write(';');
    write('\nbody {\n\tbackground: red;\n}');
}

function file() {
    require('fs').createReadStream('./sample.css').pipe(converter);
}

file();

function write(str) {
    console.log('write', str);
    converter.write(str);
}