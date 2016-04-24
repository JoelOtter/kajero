import React, { Component } from 'react';
import { connect } from 'react-redux';
import Title from './Title';
import Metadata from './Metadata';
import { metadataSelector } from '../selectors';
import { toggleEdit, toggleSave } from '../actions';

class Header extends Component {

    constructor(props) {
        super(props);
        this.toggleEditClicked = this.toggleEditClicked.bind(this);
        this.toggleSaveClicked = this.toggleSaveClicked.bind(this);
    }

    toggleEditClicked() {
        this.props.dispatch(toggleEdit());
    }

    toggleSaveClicked() {
        this.props.dispatch(toggleSave());
    }

    render() {
        const { metadata, editable, dispatch } = this.props;
        const title = metadata.get('title');
        const icon = editable ? "fa-newspaper-o" : "fa-pencil";
        document.title = title;
        const saveButton = (
            <i className="fa fa-save save-button" onClick={this.toggleSaveClicked}></i>
        );
        return (
            <div>
                <Title title={title} editable={editable} dispatch={dispatch} />
                <i className={'fa ' + icon + ' edit-button'} onClick={this.toggleEditClicked}></i>
                {editable ? saveButton : null}
                <Metadata editable={editable} metadata={metadata} dispatch={dispatch} />
            </div>
        );
    }

}

export default connect(metadataSelector)(Header);
