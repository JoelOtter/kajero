import MarkdownIt from 'markdown-it';
import fm from 'front-matter';
import Immutable from 'immutable';

import { codeToText } from './util';

const markdownIt = new MarkdownIt();

function extractImage (item) {
    const src = item.attrs[0][1];
    let alt = '';
    let title = '';
    if (item.children.length > 0 && item.children[0].type === 'text') {
        alt = item.children[0].content;
    }
    if (item.attrs.length > 2 && item.attrs[2][0] === 'title') {
        title = ' "' + item.attrs[2][1] + '"';
    }
    return '![' + alt + '](' + src + title +  ')';
}

/*
 * A helper function to add a new text block to both the blocks
 * map and ordering array.
 */
function addTextBlock(id, blocks, blockOrder, content) {
    blocks[id] = {
        type: 'text',
        id,
        content
    };
    blockOrder.push(id);
}

/*
 * If the current string isn't blank or whitespace, this flushes it
 * into a text block.
 */
function flushCurrentString(currentString, counter, blocks, blockOrder) {
    if (currentString.match(/\S+/gm)) {
        const id = String(counter);
        addTextBlock(id, blocks, blockOrder, currentString.trim());
        return counter + 1;
    }
    return counter;
}

/*
 * Flushes out current text if necessary, and adds new code block.
 */
function handleCodeInline(
    blockOrder, blocks, currentString, blockCounter, codeBlocks
) {
    let codeBlock = codeBlocks[0];
    // If not JavaScript, just add it into the text,
    // as it won't be interactive.
    if (codeBlock.get('language') !== 'javascript') {
        currentString += codeToText(codeBlock);
        return [currentString, blockCounter];
    }
    // If the current string is more than just whitespace,
    // flush it as a text block before proceeding.
    blockCounter = flushCurrentString(
        currentString, blockCounter, blocks, blockOrder
    );
    // Reset currentString, whether it's whitespace or pushed.
    currentString = "";
    // Add the code block
    const id = String(blockCounter);
    blocks[id] = codeBlock.set('id', id);
    blockOrder.push(id);
    return [currentString, blockCounter + 1];
}

/*
 * Extracts an array of code blocks (Immutable Maps) from the
 * block-parsed Markdown.
 */
export function extractCodeBlocks (body) {
    const parsedMarkdown = markdownIt.parse(body);
    let codeBlocks = [];
    for (let i = 0; i < parsedMarkdown.length; i++) {
        let block = parsedMarkdown[i];
        if (block.type === 'fence') {
            const info = block.info.split(';').map(s => s.trim());
            const language = info[0] || undefined;
            const attrs = info.splice(1);
            codeBlocks.push(Immutable.fromJS({
                type: 'code',
                content: block.content.trim(),
                language,
                attrs
            }));
        }
    }
    return codeBlocks;
}

/*
 * Extracts all blocks, after first pass which gets code blocks.
 */
export function extractBlocks (body, codeBlocks) {
    const parsedMarkdown = markdownIt.parseInline(body);
    const blockOrder = [];
    const blocks = {};

    let currentString = "";
    let linkStack = [];
    let blockCounter = 0;
    for (let n = 0; n < parsedMarkdown.length; n++) {
        const node = parsedMarkdown[n];
        for (let i = 0; i < node.children.length; i++) {
            const item = node.children[i];
            switch(item.type) {
                case 'softbreak':
                case 'hardbreak':
                    currentString += "\n";
                    break;
                case 'image':
                    currentString += extractImage(item);
                    break;
                // Links come as three components for some reason...
                case 'link_open':
                    linkStack.push(item.attrs[0][1]);
                    currentString += '[';
                    break;
                case 'link_close':
                    currentString += '](' + linkStack.pop() + ')';
                    break;
                case 'text':
                    currentString += item.content;
                    break;
                case 'code_inline':
                    const res = handleCodeInline(
                        blockOrder, blocks, currentString, blockCounter, codeBlocks
                    );
                    currentString = res[0];
                    blockCounter = res[1];
                    codeBlocks = codeBlocks.slice(1);
                    break;
                default:
                    currentString += item.markup;
            }
        }
        // Flush remaining string into text block
        flushCurrentString(currentString, blockCounter, blocks, blockOrder);
    }

    return {
        content: blockOrder,
        blocks
    };
}

export function parse(md) {
    // Separate front-matter and body
    const doc = fm(md);

    // Extract code blocks first
    const codeBlocks = extractCodeBlocks(doc.body);

    // Then extract whole thing, using codeBlocks for reference
    const {content, blocks} = extractBlocks(doc.body, codeBlocks);

    return Immutable.fromJS({
        metadata: {
            title: doc.attributes.title,
            created: Date.parse(doc.attributes.created) || undefined,
            author: doc.attributes.author,
            datasources: doc.attributes.datasources || {},
            original: doc.attributes.original,
            showFooter: doc.attributes.show_footer !== false
        },
        content,
        blocks
    });
}

/*
 * Functions for rendering blocks back into Markdown
 */

function renderDatasources(datasources) {
    let rendered = "datasources:\n";
    datasources.map((url, name) => {
        rendered += '    ' + name + ': ' + url + '\n';
    });
    return rendered;
}

function renderMetadata(metadata) {
    let rendered = '---\n';
    if (metadata.get('title') !== undefined) {
        rendered += 'title: ' + metadata.get('title') + '\n';
    }
    if (metadata.get('author') !== undefined) {
        rendered += 'author: ' + metadata.get('author') + '\n';
    }
    if (metadata.get('created') !== undefined) {
        rendered += 'created: ' +
            new Date(metadata.get('created')).toString() + '\n';
    }
    const datasources = metadata.get('datasources');
    if (datasources && datasources.size > 0) {
        rendered += renderDatasources(datasources);
    }
    const original = metadata.get('original');
    if (original && original.get('title') && original.get('url')) {
        rendered += 'original:\n';
        rendered += '    title: ' + original.get('title') + '\n';
        rendered += '    url: ' + original.get('url') + '\n';
    }
    if (metadata.get('showFooter') !== undefined) {
        rendered += 'show_footer: ' + metadata.get('showFooter') + '\n';
    }
    return rendered + '---\n\n';
}

function renderBlock(block) {
    if (block.get('type') === 'code') {
        return codeToText(block);
    }
    return block.get('content');
}

function renderBody(blocks, blockOrder) {
    return blockOrder
        .map((id) => blocks.get(id))
        .map(renderBlock)
        .join('\n\n') + '\n';
}

export function render(notebook) {
    let rendered = "";
    rendered += renderMetadata(notebook.get('metadata'));
    rendered += renderBody(notebook.get('blocks'), notebook.get('content'));
    return rendered;
}
