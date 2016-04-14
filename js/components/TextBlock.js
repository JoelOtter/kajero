import React from 'react';
import MarkdownIt from 'markdown-it';
import Block from './Block';
import { highlight } from '../util';

const md = new MarkdownIt({highlight});

class TextBlock extends Block {

    constructor(props) {
        super(props);
    }

    rawMarkup(markdown) {
        return {__html: md.render(markdown)};
    }

    renderViewerMode() {
        const { block } = this.props;
        return (
            <div className="text-block"
                dangerouslySetInnerHTML={this.rawMarkup(block.get('content'))}
                onClick={this.enterEdit}>
            </div>
        );
    }

}

export default TextBlock;
