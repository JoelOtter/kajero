import MarkdownIt from 'markdown-it';
import fm from 'front-matter';
import Immutable from 'immutable';

import { codeToText } from './util';

let markedownIt = new MarkdownIt();

function parse(md) {
    const content = fm(md);
    const parsedMarkdown = markedownIt.parseInline(content.body);
    const blockParsedMarkdown = markedownIt.parse(content.body);

    // Extract code blocks first
    let codeBlocks = [];
    for (let block of blockParsedMarkdown) {
        if (block.type === 'fence') {
            const info = block.info.split(';').map(s => s.trim());
            const language = info[0];
            const attrs = info.splice(1);
            codeBlocks.push(Immutable.fromJS({
                type: 'code',
                content: block.content.trim(),
                language,
                attrs,
                hasBeenRun: false
            }));
        }
    }

    // Rebuild into array of text and code blocks.
    let body = [];
    let blocks = {};
    let currentString = "";
    let codeCounter = 0;
    let blockCounter = 0;
    let linkStack = [];
    for (let node of parsedMarkdown) {
        for (let item of node.children) {
            switch(item.type) {
                case 'code_inline':
                    const codeBlock = codeBlocks[codeCounter];
                    // If a code block isn't JavaScript, we'll just render it in
                    // the text box, as it won't be interactive.
                    if (codeBlock.get('language') === 'javascript') {
                        body.push(blockCounter);
                        blocks[blockCounter] = {
                            type: 'text',
                            id: String(blockCounter),
                            content: currentString
                        };
                        blockCounter += 1;
                        currentString = "";
                        blocks[blockCounter] = codeBlock.set('id', String(blockCounter));
                        body.push(blockCounter);
                        blockCounter += 1;
                    } else {
                        currentString += codeToText(codeBlock);
                    }
                    codeCounter += 1;
                    break;
                case 'softbreak':
                case 'hardbreak':
                    currentString += "\n\n";
                    break;
                case 'image':
                    const src = item.attrs[0][1];
                    const alt = item.attrs[1][1];
                    currentString += '![' + alt + '](' + src + ')';
                    break;
                // Links come as three components for some reason...
                case 'link_open':
                    linkStack.push(item.attrs[0][1]);
                    currentString += '[';
                    break;
                case 'link_close':
                    currentString += '](' + linkStack.pop() + ')';
                    break;
                default:
                    currentString += item.content;
            }
        }
        if (currentString.length > 0) {
            body.push(blockCounter);
            blocks[blockCounter] = {
                type: 'text',
                id: String(blockCounter),
                content: currentString
            };
        }
    }

    return Immutable.fromJS({
        metadata: {
            title: content.attributes.title,
            created: Date.parse(content.attributes.created),
            author: content.attributes.author
        },
        content: body,
        blocks: blocks
    });
}

export default parse;
