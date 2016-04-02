import React, { Component } from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

class TextBlock extends Component {

    rawMarkup(markdown) {
        return {__html: md.render(markdown)};
    }

    render() {
        const { content } = this.props;
        return (
            <div dangerouslySetInnerHTML={this.rawMarkup(content)}></div>
        );
    }

}

export default TextBlock;
