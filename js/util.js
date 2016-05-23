import hljs from 'highlight.js';
import config from './config';

export function codeToText(codeBlock, includeOption) {
    let result = "```";
    result += codeBlock.get('language');
    const option = codeBlock.get('option');
    if (includeOption && option) {
        const sep = '; ';
        result += '; ' + option;
    }
    result += "\n";
    result += codeBlock.get('content');
    result += "\n```";
    return result;
}


export function highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
        try {
            return hljs.highlight(lang, str).value;
        } catch (__) {}
    }
    return ''; // use external default escaping
}

export function extractMarkdownFromHTML() {
    let text = document.getElementById('kajero-md').text;
    const lines = text.split("\n");
    let leadingSpaces;
    // Find line where front-matter starts
    for (let line = 0; line < lines.length; line++) {
        leadingSpaces = lines[line].indexOf('-');
        if (leadingSpaces > -1) {
            text = lines.splice(line).join("\n");
            break;
        }
    }
    const re = new RegExp("^ {" + leadingSpaces + "}", "gm");
    return text.replace(re, "");
}

export function renderHTML(markdown) {
    let result = "<!DOCTYPE html>\n<html>\n    <head>\n";
    result += '        <meta name="viewport" content="width=device-width, initial-scale=1">\n';
    result += '        <meta http-equiv="content-type" content="text/html; charset=UTF8">\n';
    result += '        <link rel="stylesheet" href="' + config.cssUrl + '">\n';
    result += '    </head>\n    <body>\n        <script type="text/markdown" id="kajero-md">\n';
    result += markdown.split('\n').map((line) => {
        if (line.match(/\S+/m)) {
            return '            ' + line;
        }
        return '';
    }).join('\n');
    result += '        </script>\n';
    result += '        <div id="kajero"></div>\n';
    result += '        <script type="text/javascript" src="' + config.scriptUrl + '"></script>\n';
    result += '    </body>\n</html>\n';
    return result;
}
