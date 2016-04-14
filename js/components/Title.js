import React, { Component } from 'react';

class Title extends Component {

    render() {
        const { title, editable } = this.props;
        if (editable) {
            return (
                <h1>
                    <input type="text" className="title-field"
                        placeholder="Notebook title"
                        defaultValue={title}/>
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
