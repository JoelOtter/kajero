import React, { Component } from 'react';
import { connect } from 'react-redux';

import Title from './components/Title';
import Metadata from './components/Metadata';
import TextBlock from './components/TextBlock';
import CodeBlock from './components/CodeBlock';
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
            } else if (block.type === 'code') {
                blocks.push(<CodeBlock codeBlock={block} key={String(i)} />);
            }
        }
        return (
            <div className="pure-g">
                <div className="offset-col pure-u-1 pure-u-md-1-6">
                    &nbsp;
                </div>
                <div className="pure-u-1 pure-u-md-2-3">
                    <Title title={title} />
                    <Metadata author={author} created={created} />
                    <hr className="top-sep"></hr>
                    {blocks}
                </div>
            </div>
        );
    }

}

export default connect(notebookSelector)(Notebook);
