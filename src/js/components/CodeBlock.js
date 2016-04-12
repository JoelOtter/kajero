import React, { Component } from 'react';
import MarkdownIt from 'markdown-it';
import Visualiser from './visualiser/Visualiser';
import { codeToText, highlight } from '../util';
import { executeCodeBlock } from '../actions';

const md = new MarkdownIt({highlight});

class CodeBlock extends Component {

    rawMarkup(codeBlock) {
        return {
            __html: md.render(codeToText(codeBlock))
        };
    }

    clickPlay(dispatch, codeBlock) {
        dispatch(executeCodeBlock(codeBlock));
    }

    render() {
        const { dispatch, codeBlock } = this.props;
        const hasBeenRun = codeBlock.get('hasBeenRun');
        const icon = hasBeenRun ? "fa-repeat" : "fa-play-circle-o";
        const result = codeBlock.get('result');
        return (
            <div className="codeContainer">
                <div className="codeBlock">
                    <div dangerouslySetInnerHTML={this.rawMarkup(codeBlock)}></div>
                    <i className={"fa " + icon} onClick={this.clickPlay.bind(this, dispatch, codeBlock)}></i>
                </div>
                <div hidden={!hasBeenRun} className="graphBlock" id={"kajero-graph-" + codeBlock.get('id')}>
                </div>
                <div hidden={!hasBeenRun} className="resultBlock">
                    <Visualiser
                        data={result}
                        useHljs='true'
                    />
                </div>
            </div>
        );
    }

}

export default CodeBlock;
