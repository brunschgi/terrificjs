load("build/js/writeFile.js");

var file = arguments[0];
var version = arguments[1];
var api = arguments[2];

var date = new Date();

writeFile(file, readFile(file).replace("@VERSION", version));
writeFile(file, readFile(file).replace("@DATE", date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear()));
