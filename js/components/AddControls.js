import React, { Component } from 'react';
import { addCodeBlock, addTextBlock, addGraphBlock } from '../actions';

export default class AddControls extends Component {

    constructor(props) {
        super(props);
        this.addCodeBlock = this.addCodeBlock.bind(this);
        this.addTextBlock = this.addTextBlock.bind(this);
        this.addGraphBlock = this.addGraphBlock.bind(this);
    }

    addCodeBlock() {
        this.props.dispatch(addCodeBlock(this.props.id));
    }

    addTextBlock() {
        this.props.dispatch(addTextBlock(this.props.id));
    }

    addGraphBlock() {
        this.props.dispatch(addGraphBlock(this.props.id));
    }

    render() {
        const {editable} = this.props;
        if (!editable) {
            return null;
        }
        return (
            <div className="add-controls">
                <i className="fa fa-file-text-o clickable" onClick={this.addTextBlock}
                    title="New text block">
                </i>
                <i className="fa fa-file-code-o clickable" onClick={this.addCodeBlock}
                    title="New code block">
                </i>
                <i className="fa fa-bar-chart clickable" onClick={this.addGraphBlock}
                    title="New graph">
                </i>
            </div>
        );
    }

}
