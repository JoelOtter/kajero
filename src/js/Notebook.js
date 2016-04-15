import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import { loadMarkdown, fetchData } from './actions';
import { extractMarkdownFromHTML } from './util';
import { editorSelector } from './selectors';

class Notebook extends Component {

    componentWillMount() {
        this.props.dispatch(loadMarkdown(extractMarkdownFromHTML()));
    }

    componentDidMount() {
        this.props.dispatch(fetchData());
    }

    render() {
        const { editable } = this.props;
        const cssClass = editable ? ' editable' : '';
        return (
            <div className="pure-g">
                <div className="offset-col pure-u-1 pure-u-md-1-8 pure-u-lg-1-6">
                    &nbsp;
                </div>
                <div className={'pure-u-1 pure-u-md-3-4 pure-u-lg-2-3' + cssClass}>
                    <Header editable={editable} />
                    <hr className="top-sep"></hr>
                    <Content editable={editable} />
                    <Footer />
                </div>
            </div>
        );
    }

}

export default connect(editorSelector)(Notebook);
