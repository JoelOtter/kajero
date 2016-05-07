#! /usr/bin/env node

var request = require('request');

/*
 * Saves a provided Markdown file as a Gist, and returns a unique Kajero URL.
 */

var fs = require('fs');

if (process.argv.length < 3) {
    console.error("You must specify a Markdown file as a command-line argument.");
    return;
}

var md = fs.readFileSync(process.argv[2]).toString();

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
