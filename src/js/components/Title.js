import React, { Component } from 'react';

class Title extends Component {

    render() {
        const { title } = this.props;
        return (
            <h1>
                {title}
            </h1>
        );
    }

}

export default Title;
