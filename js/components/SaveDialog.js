import React, { Component } from 'react';
import { connect } from 'react-redux';
import Clipboard from 'clipboard';
import { saveSelector } from '../selectors';
import { render } from '../markdown';
import { toggleSave } from '../actions';
import { renderHTML } from '../util';
import { saveGist } from '../actions';

class SaveDialog extends Component {

    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
        this.getCssClass = this.getCssClass.bind(this);
        this.setMode = this.setMode.bind(this);
        this.state = {mode: 'md'};
    }

    close() {
        this.props.dispatch(toggleSave());
    }

    componentDidMount() {
        this.clipboard = new Clipboard('.clipboard-button', {
            text: () => {
                const markdown = render(this.props.notebook);
                switch (this.state.mode) {
                    case 'html':
                        return renderHTML(markdown);
                    case 'gist':
                        return this.props.notebook.getIn(['metadata', 'gistUrl']);
                    default:
                        return markdown;
                }
            }
        })
        .on('error', () => {
            console.warn("Clipboard isn't supported on your browser.");
        });
    }

    componentWillUnmount() {
        this.clipboard.destroy();
    }

    getCssClass(button) {
        const css = 'export-option';
        if (this.state.mode === button) {
            return css + ' selected';
        }
        return css;
    }

    setMode(newMode) {
        this.setState({mode: newMode});
        // Create the Gist if necessary
        if (newMode === 'gist' && !this.props.notebook.getIn(['metadata', 'gistUrl'])) {
            this.props.dispatch(saveGist(
                this.props.notebook.getIn(['metadata', 'title']),
                render(this.props.notebook)
            ));
        }
    }

    render() {
        const { notebook } = this.props;
        const gistUrl = notebook.getIn(['metadata', 'gistUrl']);
        const markdown = render(notebook);
        const text = (this.state.mode === 'html') ? renderHTML(markdown) : markdown;
        const textContent = (
            <div>
                <textarea readOnly value={text} />
                <span className="clipboard-button">
                    Copy to clipboard <i className="fa fa-clipboard"></i>
                </span>
            </div>
        );
        const gistContent = (
            <div>
                <div className="pure-g">
                    <div className="pure-u-1 pure-u-md-1-3">
                        <p>Your unique notebook URL:</p>
                    </div>
                    <div className="pure-u-1 pure-u-md-2-3">
                        <input type="text" readOnly
                            value={gistUrl} placeholder="Loading..."
                        />
                    </div>
                </div>
                <span className="clipboard-button">
                    Copy to clipboard <i className="fa fa-clipboard"></i>
                </span>
            </div>
        );
        return (
            <div className="save-dialog">
                <h1>Export notebook</h1>
                <p>Here you can export your edited notebook as Markdown or HTML. You can also host it as a Gist, to get a unique URL for your notebook.</p>
                <i className="fa fa-times-circle-o close-button" onClick={this.close}
                    title="Back to notebook">
                </i>
                <span className={this.getCssClass('md')} onClick={() => this.setMode('md')}>
                    <i className="fa fa-file-text-o"></i> Markdown
                </span>
                <span className={this.getCssClass('html')} onClick={() => this.setMode('html')}>
                    <i className="fa fa-code"></i> HTML
                </span>
                <span className={this.getCssClass('gist')} onClick={() => this.setMode('gist')}>
                    <i className="fa fa-github"></i> Export to Gist
                </span>
                {this.state.mode === 'gist' ? gistContent : textContent}
                <div className="footer">&nbsp;</div>
            </div>
        );
    }

}

export default connect(saveSelector)(SaveDialog);
