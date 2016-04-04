/*
 * Action types
 */
export const LOAD_MARKDOWN = 'LOAD_MARKDOWN';
export const EXECUTE = 'EXECUTE';

export function loadMarkdown(markdown) {
    return {
        type: LOAD_MARKDOWN,
        markdown: markdown
    };
}

export function executeCodeBlock(codeBlock) {
    return {
        type: EXECUTE,
        id: codeBlock.get('id'),
        code: codeBlock.get('content')
    };
}
