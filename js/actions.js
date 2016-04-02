/*
 * Action types
 */
export const LOAD_MARKDOWN = 'LOAD_MARKDOWN';

export function loadMarkdown(markdown) {
    return {
        type: LOAD_MARKDOWN,
        markdown: markdown
    };
}
