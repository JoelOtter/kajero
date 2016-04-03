import React, { Component } from 'react';

class Metadata extends Component {

    render() {
        const { author, created } = this.props;
        const date = new Date(created).toUTCString();
        return (
            <span className="metadata"><i className="fa fa-user"></i> {author} // <i className="fa fa-clock-o"></i> {date}</span>
        );
    }

}

export default Metadata;
