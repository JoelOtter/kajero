import React, { Component } from 'react';
import { connect } from 'react-redux';
import Title from './Title';
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
        const { metadata, editable } = this.props;
        const date = new Date(metadata.get('created')).toUTCString();
        const title = metadata.get('title');
        const icon = editable ? "fa-newspaper-o" : "fa-pencil";
        document.title = title;
        return (
            <div>
                <Title title={title} editable={editable} />
                <span className="metadata"><i className="fa fa-user"></i> {metadata.get('author')} // <i className="fa fa-clock-o"></i> {date}</span>
                <span className="edit-button" onClick={this.toggleEditClicked}>
                    <i className={'fa ' + icon}></i>
                </span>
            </div>
        );
    }

}

export default connect(metadataSelector)(Header);
