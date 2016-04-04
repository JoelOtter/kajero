import hljs from 'highlight.js';

export function codeToText(codeBlock) {
    let result = "```";
    result += codeBlock.get('language');
    const attrs = codeBlock.get('attrs');
    if (attrs.size > 0) {
        const sep = '; ';
        result += sep;
        result += attrs.join(sep);
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
