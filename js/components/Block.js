import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Codemirror from 'react-codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import {
    updateBlock, deleteBlock, moveBlockUp, moveBlockDown, editBlock
} from '../actions';

export default class Block extends Component {

    constructor(props) {
        super(props);
        this.enterEdit = this.enterEdit.bind(this);
        this.textChanged = this.textChanged.bind(this);
        this.getButtons = this.getButtons.bind(this);
        this.deleteBlock = this.deleteBlock.bind(this);
        this.moveBlockUp = this.moveBlockUp.bind(this);
        this.moveBlockDown = this.moveBlockDown.bind(this);
    }

    enterEdit(e) {
        if (this.props.editable) {
            e.stopPropagation();
            const { dispatch, block } = this.props;
            this.setState({
                text: block.get('content')
            });
            dispatch(editBlock(block.get('id')));
        }
    }

    textChanged(text) {
        this.setState({text});
    }

    componentDidUpdate() {
        if (this.refs.editarea) {
            this.refs.editarea.focus();
            const domNode = findDOMNode(this.refs.editarea);
            if (domNode.scrollIntoViewIfNeeded) {
                findDOMNode(this.refs.editarea).scrollIntoViewIfNeeded(false);
            }
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.editing && !newProps.editing &&
            this.props.block.get('content') === newProps.block.get('content')) {
            // If exiting edit mode, save text (unless it's an undo))
            this.props.dispatch(
                updateBlock(this.props.block.get('id'), this.state.text)
            );
        }
    }

    deleteBlock() {
        this.props.dispatch(deleteBlock(this.props.block.get('id')));
    }

    moveBlockUp() {
        this.props.dispatch(moveBlockUp(this.props.block.get('id')));
    }

    moveBlockDown() {
        this.props.dispatch(moveBlockDown(this.props.block.get('id')));
    }

    getButtons() {
        if (!this.props.editable) {
            return null;
        }
        let buttons = [];
        if (!this.props.isLast) {
            buttons.push(
                <i className="fa fa-arrow-circle-o-down" key="down"
                    onClick={this.moveBlockDown} title="Move block down">
                </i>
            );
        }
        if (!this.props.isFirst) {
            buttons.push(
                <i className="fa fa-arrow-circle-o-up" key="up"
                    onClick={this.moveBlockUp} title="Move block up">
                </i>
            );
        }
        buttons.push(
            <i className="fa fa-times-circle-o" key="delete"
                onClick={this.deleteBlock} title="Remove block">
            </i>)
        ;
        return buttons;
    }

    render() {
        const { block, editable, editing } = this.props;
        if (!(editable && editing)) {
            return this.renderViewerMode();
        }
        const isCodeBlock = block.get('type') === 'code';
        const options = {
            mode: isCodeBlock ? 'javascript' : 'markdown',
            theme: 'base16-tomorrow-light',
            lineNumbers: true,
            indentUnit: 4,
            extraKeys: {
                Tab: (cm) => {
                    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                    cm.replaceSelection(spaces);
                }
            }
        };
        return (
            <div className="edit-box" onClick={(e) => {e.stopPropagation()}}>
                <Codemirror value={this.state.text} options={options}
                    onChange={this.textChanged} ref="editarea" />
            </div>
        );
    }

}
