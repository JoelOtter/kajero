/*
 * Root class with utility functions
 */

import React, { Component } from 'react';
import DefaultVisualiser from './DefaultVisualiser';
import ObjectVisualiser from './ObjectVisualiser';
import ArrayVisualiser from './ArrayVisualiser';

const SPACING = 2;

export function typeString (item) {
    var typeString = Object.prototype.toString.call(item);
    return typeString.split(' ')[1].split(']')[0];
}

export function selectComponent (data) {
    if (data instanceof Error) {
        return DefaultVisualiser;
    }
    switch (typeString(data)) {
        case 'Object':
            return ObjectVisualiser;
        case 'Array':
            return ArrayVisualiser;
        default:
            return DefaultVisualiser;
    }

}

export function getSpacing (indent) {
    if (indent < 1) return '';
    let spaces = indent * SPACING;
    var result = '';
    for (let i = 0; i < spaces; i++) {
        result += '\u00a0';
    }
    return result;
}

export default class Visualiser extends Component {

    render() {
        const { data, useHljs, click, path, name } = this.props;
        const VisualiserComponent = selectComponent(data);
        return (
            <div className="visualiser">
                <VisualiserComponent
                    data={data}
                    indent={0}
                    useHljs={useHljs}
                    click={click}
                    name={name}
                    path={path}
                />
            </div>
        );
    }

}
