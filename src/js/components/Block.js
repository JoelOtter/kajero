import React, { Component } from 'react';
import { updateBlock, deleteBlock, moveBlockUp, moveBlockDown } from '../actions';

export default class Block extends Component {

    constructor(props) {
        super(props);
        this.state = {editing: false};
        this.enterEdit = this.enterEdit.bind(this);
        this.exitEdit = this.exitEdit.bind(this);
        this.getButtons = this.getButtons.bind(this);
        this.deleteBlock = this.deleteBlock.bind(this);
        this.moveBlockUp = this.moveBlockUp.bind(this);
        this.moveBlockDown = this.moveBlockDown.bind(this);
    }

    enterEdit() {
        if (this.props.editable) {
            this.setState({editing: true});
        }
    }

    exitEdit() {
        this.setState({editing: false});
        this.props.dispatch(
            updateBlock(this.props.block.get('id'), this.refs.editarea.value)
        );
    }

    componentDidUpdate() {
        if (this.refs.editarea) {
            this.refs.editarea.focus();
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
                    onClick={this.moveBlockDown}>
                </i>
            );
        }
        if (!this.props.isFirst) {
            buttons.push(
                <i className="fa fa-arrow-circle-o-up" key="up"
                    onClick={this.moveBlockUp}>
                </i>
            );
        }
        buttons.push(
            <i className="fa fa-times-circle-o" key="delete"
                onClick={this.deleteBlock}>
            </i>)
        ;
        return buttons;
    }

    render() {
        const { block, editable } = this.props;
        if (!editable || !this.state.editing) {
            return this.renderViewerMode();
        }
        const spellcheck = (block.get('type') !== 'code');
        const content = block.get('content');
        return (
            <textarea className="text-edit" defaultValue={content}
                onBlur={this.exitEdit} ref="editarea"
                spellCheck={spellcheck} />
        );
    }

}
