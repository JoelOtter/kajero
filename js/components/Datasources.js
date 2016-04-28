import React, { Component } from 'react';
import { deleteDatasource, updateDatasource, fetchData } from '../actions';

export default class Datasources extends Component {

    constructor(props) {
        super(props);
        this.deleteSource = this.deleteSource.bind(this);
        this.updateSource = this.updateSource.bind(this);
        this.addSource = this.addSource.bind(this);
    }

    deleteSource(name) {
        this.props.dispatch(deleteDatasource(name));
    }

    updateSource(name) {
        this.props.dispatch(
            updateDatasource(name, this.refs['set-' + name].value)
        );
        this.props.dispatch(fetchData());
    }

    addSource() {
        const name = this.refs['new-name'].value;
        const url = this.refs['new-url'].value;
        if (name === '' || name === undefined || url === '' || url === undefined) {
            return;
        }
        this.props.dispatch(updateDatasource(name, url));
        this.refs['new-name'].value = '';
        this.refs['new-url'].value = '';
        this.props.dispatch(fetchData());
    }

    render() {
        const { datasources } = this.props;
        let result = [];
        for (let [name, source] of datasources) {
            result.push(
                <div className="pure-g datasource" key={name}>
                    <i className="fa fa-times-circle-o pure-u-1-12 pure-u-md-1-24"
                        onClick={() => this.deleteSource(name)} title="Remove datasource">
                    </i>
                    <div className="pure-u-11-12 pure-u-md-7-24 source-name">
                        <p>{name}</p>
                    </div>
                    <div className="pure-u-1 pure-u-md-2-3 source-url">
                        <input type="text" defaultValue={source} ref={'set-' + name}
                            onBlur={() => this.updateSource(name)} />
                    </div>
                </div>
            );
        }
        return (
            <div>
                {result}
                <div className="pure-g datasource">
                    <i className="fa fa-plus pure-u-1-12 pure-u-md-1-24"
                        onClick={this.addSource} title="Add datasource">
                    </i>
                    <div className="pure-u-11-12 pure-u-md-7-24 source-name">
                        <input type="text" ref="new-name" placeholder="Data source name" />
                    </div>
                    <div className="pure-u-1 pure-u-md-2-3 source-url">
                        <input type="text" ref="new-url" placeholder="URL" />
                    </div>
                </div>
            </div>
        );
    }
}
