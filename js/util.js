export function codeToText(codeBlock) {
    let result = "```";
    result += codeBlock.language;
    if (codeBlock.attrs.length > 0) {
        const sep = '; ';
        result += sep;
        result += attrs.join(sep);
    }
    result += "\n";
    result += codeBlock.content;
    result += "\n```";
    return result;
}
