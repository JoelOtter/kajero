import React, { Component } from 'react';
import { connect } from 'react-redux';
import Title from './Title';
import { metadataSelector } from '../selectors';

class Header extends Component {

    render() {
        const { metadata } = this.props;
        const date = new Date(metadata.get('created')).toUTCString();
        return (
            <div>
                <Title title={metadata.get('title')} />
                <span className="metadata"><i className="fa fa-user"></i> {metadata.get('author')} // <i className="fa fa-clock-o"></i> {date}</span>
            </div>
        );
    }

}

export default connect(metadataSelector)(Header);
