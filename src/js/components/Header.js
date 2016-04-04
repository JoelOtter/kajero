import React, { Component } from 'react';
import { connect } from 'react-redux';
import Title from './Title';
import { metadataSelector } from '../selectors';

class Header extends Component {

    render() {
        const { metadata } = this.props;
        const date = new Date(metadata.get('created')).toUTCString();
        const title = metadata.get('title');
        document.title = title;
        return (
            <div>
                <Title title={title} />
                <span className="metadata"><i className="fa fa-user"></i> {metadata.get('author')} // <i className="fa fa-clock-o"></i> {date}</span>
            </div>
        );
    }

}

export default connect(metadataSelector)(Header);
