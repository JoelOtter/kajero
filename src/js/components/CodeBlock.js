import React, { Component } from 'react';
import { codeToText } from '../util';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

class CodeBlock extends Component {

    rawMarkup(codeBlock) {
        return {
            __html: md.render(codeToText(codeBlock))
        };
    }

    render() {
        const { codeBlock } = this.props;
        return (
            <div dangerouslySetInnerHTML={this.rawMarkup(codeBlock)}></div>
        );
    }

}

export default CodeBlock;
