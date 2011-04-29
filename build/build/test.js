load("build/js/jsmin.js", "build/js/writeFile.js");

// arguments
var inFile = arguments[0];
var outFile = arguments[1] || inFile.replace(/\.js$/, ".debug.js");

var script = readFile(inFile);
var header = script.match(/\/\*(.|\n)*?\*\//)[0];
var minifiedScript = jsmin('', script, 1);

writeFile( outFile, header + minifiedScript );
