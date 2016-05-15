import React, { Component } from 'react';
import { selectComponent, typeString, getSpacing } from './Visualiser';

function buildCssClass(type, useHljs) {
    let cssSuffix;
    switch (type) {
        case 'String':
            cssSuffix = 'string'; break;
        case 'Number':
            cssSuffix = 'number'; break;
        case 'Boolean':
            cssSuffix = 'literal'; break;
        case 'Function':
            cssSuffix = 'keyword'; break;
        default:
            cssSuffix = 'text'; break;
    }
    let cssClass = "visualiser-" + cssSuffix;
    if (useHljs) {
        cssClass += " hljs-" + cssSuffix;
    }
    return cssClass;
}

export default class DefaultVisualiser extends Component {

    render() {
        const { data, indent, name, useHljs, path } = this.props;
        let click = this.props.click;
        if (click === undefined) {
            click = () => {};
        }
        const type = typeString(data);
        const repr = (type === 'String') ? "'" + String(data) + "'" :
            (type === 'Function') ? 'function()' : String(data);
            const cssClass = buildCssClass(type, useHljs);
        let key = <span className="visualiser-spacing"></span>;
        if (name) {
            key = (
                <span className="visualiser-spacing">
                    <span className="visualiser-key" onClick={() => click(name, path)}>
                        {name}
                    </span>
                    {':\u00a0'}
                </span>
            );
        }
        const spaces = getSpacing(indent);

        return (
            <div className="default-visualiser">
                <span className="visualiser-row">
                    <span className="visualiser-spacing">{spaces}</span>
                    {key}
                    <span className={cssClass}>{repr}</span>
                </span>
            </div>
        );
    }

}
