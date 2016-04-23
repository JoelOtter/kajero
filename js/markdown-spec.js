import { expect } from 'chai';
import fs from 'fs';
import Immutable from 'immutable';
import { parse, render, extractCodeBlocks } from './markdown';

function loadMarkdown(filename) {
    return fs.readFileSync('./test/' + filename + '.md').toString();
}

describe('markdown', () => {

    const sampleNotebook = Immutable.fromJS({
        metadata: {
            title: 'A sample notebook',
            author: 'Joel Auterson',
            created: Date.parse("Mon Apr 18 2016 21:48:01 GMT+0100 (BST)"),
            showFooter: true,
            original: undefined,
            datasources: {}
        },
        content: ['0', '1'],
        blocks: {
            '0': {
                type: 'text',
                id: '0',
                content: '## This is a sample Notebook\n\n' +
                    'It _should_ get correctly parsed.\n\n' +
                    '[This is a link](http://github.com)\n\n' +
                    '![Image, with alt](https://github.com/thing.jpg "Optional title")\n' +
                    '![](https://github.com/thing.jpg)\n\n' +
                    '```python\nprint "Non-runnable code sample"\n```\n\n' +
                    'And finally a runnable one...'
                },
            '1': {
                type: 'code',
                id: '1',
                language: 'javascript',
                attrs: [],
                content: 'console.log("Runnable");'
            }
        }
    });

    describe('extractCodeBlocks', () => {

        it('correctly extracts all code blocks', () => {
            const expected = Immutable.List([
                Immutable.fromJS({
                    type: 'code',
                    language: 'javascript',
                    attrs: ['hidden'],
                    content: 'console.log("Hello!");'
                }),
                Immutable.fromJS({
                    type: 'code',
                    language: undefined,
                    attrs: [],
                    content: 'print "Non-js block"'
                }),
                Immutable.fromJS({
                    type: 'code',
                    language: 'javascript',
                    content: 'return 1 + 1;',
                    attrs: []
                })
            ]);
            const sampleMd = loadMarkdown('extractCodeBlocks');

            expect(Immutable.List(extractCodeBlocks(sampleMd)).toJS())
                .to.eql(expected.toJS());
        });

    });

    describe('parse', () => {

        it('correctly parses sample markdown', () => {
            const sampleMd = loadMarkdown('sampleNotebook');
            expect(parse(sampleMd).toJS()).to.eql(sampleNotebook.toJS());
        });

        it('uses placeholders for a blank document', () => {
            const expected = Immutable.fromJS({
                metadata: {
                    title: undefined,
                    author: undefined,
                    created: undefined,
                    showFooter: true,
                    original: undefined,
                    datasources: {}
                },
                blocks: {},
                content: []
            });
            expect(parse('').toJS()).to.eql(expected.toJS());
        });

    });

    describe('render', () => {

        it('should correctly render a sample notebook', () => {
            const sampleMd = loadMarkdown('sampleNotebook');
            expect(render(sampleNotebook)).to.equal(sampleMd);
        });

        it('should correctly render an empty notebook', () => {
            const nb = Immutable.fromJS({
                metadata: {},
                blocks: {},
                content: []
            });
            const expected = '---\n---\n\n\n';
            expect(render(nb)).to.equal(expected);
        });

    });

    describe('parse and render', () => {

        it('should render a parsed notebook to the original markdown', () => {
            const sampleMd = loadMarkdown('index');
            expect(render(parse(sampleMd))).to.equal(sampleMd);
        });

    });

});
