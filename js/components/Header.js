import React, { Component } from 'react';
import { connect } from 'react-redux';
import Title from './Title';
import Metadata from './Metadata';
import { metadataSelector } from '../selectors';
import { toggleEdit, toggleSave, undo, fetchData } from '../actions';

class Header extends Component {

    constructor(props) {
        super(props);
        this.toggleEditClicked = this.toggleEditClicked.bind(this);
        this.toggleSaveClicked = this.toggleSaveClicked.bind(this);
        this.undoClicked = this.undoClicked.bind(this);
    }

    toggleEditClicked() {
        this.props.dispatch(toggleEdit());
    }

    toggleSaveClicked() {
        this.props.dispatch(toggleSave());
    }

    undoClicked() {
        this.props.dispatch(undo());
        this.props.dispatch(fetchData());
    }

    render() {
        const { metadata, editable, undoSize, dispatch } = this.props;
        const title = metadata.get('title');
        const icon = editable ? "fa-newspaper-o" : "fa-pencil";
        document.title = title;
        const saveButton = (
            <i className="fa fa-save" onClick={this.toggleSaveClicked}
                title="Export notebook">
            </i>
        );
        const undoButton = (
            <i className="fa fa-rotate-left" onClick={this.undoClicked} title="Undo">
            </i>
        );
        const changesMade = editable && undoSize > 0;
        return (
            <div>
                <Title title={title} editable={editable} dispatch={dispatch} />
                <span className="controls">
                    {changesMade ? undoButton : null}
                    {changesMade ? saveButton : null}
                    <i className={'fa ' + icon} onClick={this.toggleEditClicked}
                        title={editable ? "Exit edit mode" : "Enter edit mode"}>
                    </i>
                </span>
                <Metadata editable={editable} metadata={metadata} dispatch={dispatch} />
            </div>
        );
    }

}

export default connect(metadataSelector)(Header);
