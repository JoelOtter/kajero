import React from 'react';
import MarkdownIt from 'markdown-it';
import Block from './Block';
import { highlight } from '../util';

const md = new MarkdownIt({highlight, html: true});

class TextBlock extends Block {

    constructor(props) {
        super(props);
    }

    rawMarkup(markdown) {
        return {__html: md.render(markdown)};
    }

    renderViewerMode() {
        const { block } = this.props;
        const buttons = this.getButtons();
        return (
            <div className="text-block">
                <div className="editor-buttons">
                    {buttons}
                </div>
                <div className="text-block-content"
                    dangerouslySetInnerHTML={this.rawMarkup(block.get('content'))}
                    onClick={this.enterEdit}>
                </div>
            </div>
        );
    }

}

export default TextBlock;
