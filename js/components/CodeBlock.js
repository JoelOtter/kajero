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
        this.state = {editing: false};
        this.clickPlay = this.clickPlay.bind(this, props.dispatch, props.codeBlock);
        this.enterEdit = this.enterEdit.bind(this);
        this.exitEdit = this.exitEdit.bind(this);
    }

    rawMarkup(codeBlock) {
        return {
            __html: md.render(codeToText(codeBlock))
        };
    }

    clickPlay(dispatch, codeBlock) {
        dispatch(executeCodeBlock(codeBlock));
    }

    enterEdit() {
        if (this.props.editable) {
            this.setState({editing: true});
        }
    }

    exitEdit() {
        this.setState({editing: false});
    }

    componentDidUpdate() {
        if (this.refs.editarea) {
            this.refs.editarea.focus();
        }
    }

    render() {
        const { id, codeBlock, hasBeenRun, result } = this.props;
        const icon = hasBeenRun ? "fa-repeat" : "fa-play-circle-o";
        if (this.props.editable && this.state.editing) {
            return (
                <textarea className="text-edit" defaultValue={codeBlock.get('content')}
                    onBlur={this.exitEdit} ref="editarea" spellCheck="false" />
            );
        }
        return (
            <div className="codeContainer">
                <div className="codeBlock">
                    <div onClick={this.enterEdit}
                        dangerouslySetInnerHTML={this.rawMarkup(codeBlock)}>
                    </div>
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

export default CodeBlock;
