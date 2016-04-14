import React, { Component } from 'react';
import { connect } from 'react-redux';
import { contentSelector } from '../selectors';
import TextBlock from './TextBlock';
import CodeBlock from './CodeBlock';

class Content extends Component {

    render() {
        const { dispatch, content, results, blocksExecuted, editable } = this.props;
        let blocks = [];
        for (let i = 0; i < content.size; i++) {
            const block = content.get(i);
            switch(block.get('type')) {
                case 'text':
                    blocks.push(
                        <TextBlock editable={editable} dispatch={dispatch}
                            block={block} key={String(i)}
                        />
                    );
                    break;
                case 'code':
                    const id = block.get('id');
                    const hasBeenRun = blocksExecuted.includes(id);
                    const result = results.get(id);
                    blocks.push(
                        <CodeBlock
                            block={block} result={result} editable={editable}
                            key={String(i)} hasBeenRun={hasBeenRun} dispatch={dispatch}
                        />
                    );
                    break;
            }
        }
        return <div>{blocks}</div>;
    }

}

export default connect(contentSelector)(Content);
