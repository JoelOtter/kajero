#! /usr/bin/env node

/*
 * Converts a Markdown file to a Kajero notebook as an HTML file.
 */

var fs = require('fs');

if (process.argv.length < 3) {
    console.error("You must specify a Markdown file as a command-line argument.");
    return;
}

var md = fs.readFileSync(process.argv[2]).toString();

console.log(renderHTML(md));

function renderHTML(markdown) {
    var result = "<html>\n    <head>\n";
    result += '        <meta name="viewport" content="width=device-width, initial-scale=1">\n';
    result += '        <meta http-equiv="content-type" content="text/html; charset=UTF8">\n';
    result += '        <link rel="stylesheet" href="http://www.joelotter.com/kajero/dist/main.css">\n';
    result += '    </head>\n    <body>\n        <script type="text/markdown" id="kajero-md">\n';
    result += markdown.split('\n').map((line) => {
        if (line.match(/\S+/m)) {
            return '            ' + line;
        }
        return '';
    }).join('\n');
    result += '        </script>\n';
    result += '        <div id="kajero"></div>\n';
    result += '        <script type="text/javascript" src="http://www.joelotter.com/kajero/dist/bundle.js"></script>\n';
    result += '    </body>\n</html>\n';
    return result;
}
