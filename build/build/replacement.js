load("build/js/writeFile.js");

var file = arguments[0];
var version = arguments[1];
var api = arguments[2];

var date = new Date();
var script = readFile(file);

script = script.replace("@YEAR", date.getFullYear());
script = script.replace("@VERSION", version);
script = script.replace("@DATE", date.toUTCString());

// remove log statements
script = script.replace(/\$\.log\..+\(.+\);/ig,"");

writeFile(file, script);
