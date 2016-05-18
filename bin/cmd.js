#! /usr/bin/env node

var request = require('request');
var fs = require('fs');

if (process.argv.length < 3) {
    console.error("You must specify a Markdown file as a command-line argument.");
    return;
}

if (process.argv[2] !== 'html' && process.argv[2] !== 'publish') {
    console.error("Unrecognised command. Available commands:\nhtml\npublish");
    return
}

var command = process.argv[2];
var md = fs.readFileSync(process.argv[3]).toString();

var f = (command === 'html') ? saveHTML : saveGist;
f(md);

function saveHTML(markdown) {
    var result = "<!DOCTYPE html>\n<html>\n    <head>\n";
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
    console.log(result);
}

function saveGist(markdown) {
    var options = {
        uri: 'https://api.github.com/gists',
        method: 'POST',
        headers: {
            'User-Agent': 'Kajero'
        },
        json: {
            description: 'Kajero notebook',
            public: true,
            files: {
                'notebook.md': {
                    content: md
                }
            }
        }
    };

    request(options, function(err, response, body) {
        console.log('http://www.joelotter.com/kajero/?id=' + body.id);
    });
}
