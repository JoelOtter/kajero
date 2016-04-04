import React, { Component } from 'react';
import { connect } from 'react-redux';
import { contentSelector } from '../selectors';
import TextBlock from './TextBlock';
import CodeBlock from './CodeBlock';

class Content extends Component {

    render() {
        const { content, dispatch } = this.props;
        let blocks = [];
        for (let i = 0; i < content.size; i++) {
            const block = content.get(i);
            switch(block.get('type')) {
                case 'text':
                    blocks.push(<TextBlock content={block.get('content')} key={String(i)} />);
                    break;
                case 'code':
                    blocks.push(<CodeBlock dispatch={dispatch} codeBlock={block} key={String(i)} />);
                    break;
            }
        }
        return <div>{blocks}</div>;
    }

}

export default connect(contentSelector)(Content);
