import React, { Component } from 'react';
import { updateAuthor } from '../actions';

export default class Metadata extends Component {

    constructor(props) {
        super(props);
        this.updateAuthor = this.updateAuthor.bind(this);
    }

    updateAuthor() {
        this.props.dispatch(updateAuthor(this.refs.authorField.value));
    }

    render() {
        const { author, created, editable } = this.props;
        const date = new Date(created).toUTCString();
        if (editable) {
            return (
                <div className="metadata">
                    <div className="metadata-row">
                        <i className="fa fa-user"></i>
                        <input type="text" defaultValue={author}
                            ref="authorField" onBlur={this.updateAuthor} />
                    </div>
                    <div className="metadata-row">
                        <i className="fa fa-check-circle clickable"></i>
                        <span>Link to original notebook</span>
                    </div>
                    <div className="metadata-row">
                        <i className="fa fa-check-circle clickable"></i>
                        <span>Show Kajero footer</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="metadata">
                <span className="metadata-item">
                    <i className="fa fa-user"></i>{'\u00a0' + author}
                </span>
                <span className="metadata-sep">{'\u00a0//\u00a0'}</span>
                <span className="metadata-item">
                    <i className="fa fa-clock-o"></i>{'\u00a0' + date}
                </span>
            </div>
        );
    }

}
