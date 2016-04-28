import React, { Component } from 'react';
import { updateTitle } from '../actions';

class Title extends Component {

    constructor(props) {
        super(props);
        this.exitEdit = this.exitEdit.bind(this);
    }

    exitEdit() {
        this.props.dispatch(updateTitle(this.refs.titleField.value));
    }

    render() {
        const { title, editable } = this.props;
        if (editable) {
            return (
                <h1>
                    <input type="text" className="title-field"
                        placeholder="Notebook title"
                        defaultValue={title}
                        ref="titleField" title="Notebook title"
                        onBlur={this.exitEdit}
                    />
                </h1>
            );
        }
        return (
            <h1>
                {title}
            </h1>
        );
    }

}

export default Title;
