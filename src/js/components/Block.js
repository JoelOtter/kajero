import React, { Component } from 'react';

export default class Block extends Component {

    constructor(props) {
        super(props);
        this.state = {editing: false};
        this.enterEdit = this.enterEdit.bind(this);
        this.exitEdit = this.exitEdit.bind(this);
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
