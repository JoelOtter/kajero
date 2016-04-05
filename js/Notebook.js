import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from './components/Header';
import Content from './components/Content';
import { loadMarkdown } from './actions';
import { extractMarkdownFromHTML } from './util';

class Notebook extends Component {

    componentWillMount() {
        this.props.dispatch(loadMarkdown(extractMarkdownFromHTML()));
    }

    render() {
        return (
            <div className="pure-g">
                <div className="offset-col pure-u-1 pure-u-md-1-8 pure-u-lg-1-6">
                    &nbsp;
                </div>
                <div className="pure-u-1 pure-u-md-3-4 pure-u-lg-2-3">
                    <Header />
                    <hr className="top-sep"></hr>
                    <Content />
                </div>
            </div>
        );
    }

}

export default connect()(Notebook);
