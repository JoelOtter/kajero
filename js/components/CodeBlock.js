import React, { Component } from 'react';
import { connect } from 'react-redux';
import MarkdownIt from 'markdown-it';
import Visualiser from './visualiser/Visualiser';
import { codeToText, highlight } from '../util';
import { executeCodeBlock } from '../actions';
import { executionSelector } from '../selectors';

const md = new MarkdownIt({highlight});

class CodeBlock extends Component {

    constructor(props) {
        super(props);
        this.clickPlay = this.clickPlay.bind(this, props.dispatch, props.codeBlock);
    }

    rawMarkup(codeBlock) {
        return {
            __html: md.render(codeToText(codeBlock))
        };
    }

    clickPlay(dispatch, codeBlock) {
        dispatch(executeCodeBlock(codeBlock));
    }

    render() {
        const { dispatch, codeBlock, blocksExecuted, results } = this.props;
        const id = codeBlock.get('id');
        const hasBeenRun = blocksExecuted.includes(id);
        const icon = hasBeenRun ? "fa-repeat" : "fa-play-circle-o";
        const result = results.get(id);
        return (
            <div className="codeContainer">
                <div className="codeBlock">
                    <div dangerouslySetInnerHTML={this.rawMarkup(codeBlock)}></div>
                    <i className={"fa " + icon} onClick={this.clickPlay}></i>
                </div>
                <div hidden={!hasBeenRun} className="graphBlock" id={"kajero-graph-" + id}>
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

export default connect(executionSelector)(CodeBlock);
