import React, { Component } from 'react';
import { connect } from 'react-redux';

import Title from './components/Title';
import Metadata from './components/Metadata';
import TextBlock from './components/TextBlock';
import { notebookSelector } from './selectors';
import { loadMarkdown } from './actions';

class Notebook extends Component {

    componentWillMount() {
        this.props.dispatch(loadMarkdown(
            document.getElementById('kajeromd').text.replace(/^\s+/gm, "")
        ));
    }

    render() {
        const { title, content, author, created } = this.props;
        document.title = title;
        let blocks = [];
        for (let i = 0; i < content.length; i++) {
            const block = content[i];
            if (block.type === 'text') {
                blocks.push(<TextBlock content={block.content} key={String(i)} />);
            }
        }
        return (
            <div>
                <Title title={title} />
                <Metadata author={author} created={created} />
                {blocks}
            </div>
        );
    }

}

export default connect(notebookSelector)(Notebook);
