import React, { Component } from 'react';

class Metadata extends Component {

    render() {
        const { author, created } = this.props;
        const date = new Date(created).toUTCString();
        return (
            <p>{author} | {date}</p>
        );
    }

}

export default Metadata;
