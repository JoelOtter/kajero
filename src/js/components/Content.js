import React, { Component } from 'react';
import { connect } from 'react-redux';
import { contentSelector } from '../selectors';
import TextBlock from './TextBlock';
import CodeBlock from './CodeBlock';
import AddControls from './AddControls';

class Content extends Component {

    render() {
        const { dispatch, content, results, blocksExecuted, editable } = this.props;
        let blocks = [];
        for (let i = 0; i < content.size; i++) {
            const block = content.get(i);
            const isFirst = (i === 0);
            const isLast = (i === content.size - 1);
            blocks.push(
                <AddControls key={'add' + i} dispatch={dispatch}
                    id={block.get('id')} editable={editable} />
            );
            switch(block.get('type')) {
                case 'text':
                    blocks.push(
                        <TextBlock editable={editable} dispatch={dispatch}
                            block={block} key={String(i)} isFirst={isFirst}
                            isLast={isLast}
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
                            isFirst={isFirst} isLast={isLast}
                        />
                    );
                    break;
            }
        }
        blocks.push(
            <AddControls key="add-end" dispatch={dispatch} editable={editable} />
        );
        return <div>{blocks}</div>;
    }

}

export default connect(contentSelector)(Content);
