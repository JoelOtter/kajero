import React, { Component } from 'react';
import { connect } from 'react-redux';
import { metadataSelector } from '../selectors';

class Footer extends Component {

    render() {
        const { metadata } = this.props;
        if (!metadata.get('showFooter')) {
            return <div className="footer"></div>;
        }
        const originalTitle = metadata.getIn(['original', 'title']);
        const originalUrl = metadata.getIn(['original', 'url']);
        return (
            <div className="footer">
                <hr className="footer-sep top-sep" />
                <span className="footer-row">
                    <i className="fa fa-sitemap"></i>&nbsp;
                    Forked from <a href={originalUrl}>{originalTitle}</a>.
                </span>
                <span className="footer-row">
                    <i className="fa fa-flask"></i>&nbsp;
                    Made with <a href="http://joelotter.com/kajero">Kajero</a>.
                </span>
            </div>
        );
    }

}

export default connect(metadataSelector)(Footer);
