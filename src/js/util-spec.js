import { expect } from 'chai';
import Immutable from 'immutable';
import jsdom from 'mocha-jsdom';
import sinon from 'sinon';
import fs from 'fs';
import * as util from './util';

describe('util', () => {

    describe('codeToText', () => {

        it('should correctly transform a code block to text', () => {
            const codeBlock = Immutable.fromJS({
                type: 'code',
                language: 'javascript',
                option: 'hidden',
                content: 'return 1 + 2;'
            });
            const expected = '```javascript\nreturn 1 + 2;\n```';
            expect(util.codeToText(codeBlock)).to.equal(expected);
        });

        it('should include option if includeOption is true ', () => {
            const codeBlock = Immutable.fromJS({
                type: 'code',
                language: 'javascript',
                option: 'hidden',
                content: 'return 1 + 2;'
            });
            const expected = '```javascript; hidden\nreturn 1 + 2;\n```';
            expect(util.codeToText(codeBlock, true)).to.equal(expected);
        });

    });

    describe('highlight', () => {

        it('correctly highlights code', () => {
            const expected = '<span class="hljs-built_in">console</span>' +
                '.log(<span class="hljs-string">"hello"</span>);';
            expect(util.highlight('console.log("hello");', 'javascript'))
                .to.equal(expected);
        });

        it('returns nothing for an unsupported language', () => {
            expect(util.highlight('rubbish', 'dfhjf')).to.equal('');
        });
    });

    describe('extractMarkdownFromHTML', () => {

        before(() => {
            sinon.stub(document, "getElementById").returns({
                text: '\n    ---\n    ---\n\n    ## This has spaces\n\n        Are they removed?'
            });
        });

        after(() => {
            document.getElementById.restore()
        });

        it('correctly removes indentation when loading Markdown from HTML', () => {
            const expected = '---\n---\n\n## This has spaces\n\n    Are they removed?';
            expect(util.extractMarkdownFromHTML()).to.equal(expected);
        });

    });

    describe('renderHTML', () => {

        it('should correctly render the index.html from its markdown', () => {
            const indexMd = fs.readFileSync('./test/index.md').toString();
            const indexHTML = fs.readFileSync('./test/index.html').toString();
            expect(util.renderHTML(indexMd)).to.equal(indexHTML);
        });

    });

});
