import React, { Component } from 'react';
import MarkdownIt from 'markdown-it';
import { highlight } from '../util';

const md = new MarkdownIt({highlight});

class TextBlock extends Component {

    constructor(props) {
        super(props);
        this.state = {editing: false};
        this.enterEdit = this.enterEdit.bind(this);
        this.exitEdit = this.exitEdit.bind(this);
    }

    rawMarkup(markdown) {
        return {__html: md.render(markdown)};
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
        const { content, editable } = this.props;
        if (editable && this.state.editing) {
            return (
                <textarea className="text-edit" defaultValue={content}
                    onBlur={this.exitEdit} ref="editarea" />
            );
        }
        return (
            <div className="text-block"
                dangerouslySetInnerHTML={this.rawMarkup(content)}
                onClick={this.enterEdit}>
            </div>
        );
    }

}

export default TextBlock;
