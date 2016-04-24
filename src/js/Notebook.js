import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import SaveDialog from './components/SaveDialog';
import { loadMarkdown, fetchData } from './actions';
import { editorSelector } from './selectors';

class Notebook extends Component {

    componentWillMount() {
        this.props.dispatch(loadMarkdown());
    }

    componentDidMount() {
        this.props.dispatch(fetchData());
    }

    render() {
        const { editable, saving } = this.props;
        const cssClass = editable ? ' editable' : '';
        const notebookView = (
            <div className={'pure-u-1 pure-u-md-3-4 pure-u-lg-2-3' + cssClass}>
                <Header editable={editable} />
                <hr className="top-sep"></hr>
                <Content editable={editable} />
                <Footer />
            </div>
        );
        const saveView = (
            <div className="pure-u-1 pure-u-md-3-4 pure-u-lg-2-3">
                <SaveDialog />
            </div>
        );
        const content = saving ? saveView : notebookView;
        return (
            <div className="pure-g">
                <div className="offset-col pure-u-1 pure-u-md-1-8 pure-u-lg-1-6">
                    &nbsp;
                </div>
                {content}
            </div>
        );
    }

}

export default connect(editorSelector)(Notebook);
