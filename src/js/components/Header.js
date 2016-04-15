import React, { Component } from 'react';
import { connect } from 'react-redux';
import Title from './Title';
import Metadata from './Metadata';
import { metadataSelector } from '../selectors';
import { toggleEdit } from '../actions';

class Header extends Component {

    constructor(props) {
        super(props);
        this.toggleEditClicked = this.toggleEditClicked.bind(this, props.dispatch);
    }

    toggleEditClicked(dispatch) {
        dispatch(toggleEdit());
    }

    render() {
        const { metadata, editable, dispatch } = this.props;
        const title = metadata.get('title');
        const icon = editable ? "fa-newspaper-o" : "fa-pencil";
        document.title = title;
        return (
            <div>
                <Title title={title} editable={editable} dispatch={dispatch} />
                <span className="edit-button" onClick={this.toggleEditClicked}>
                    <i className={'fa ' + icon}></i>
                </span>
                <Metadata editable={editable} metadata={metadata} dispatch={dispatch} />
            </div>
        );
    }

}

export default connect(metadataSelector)(Header);
