import React, { Component } from 'react';
import { selectComponent, getSpacing } from './Visualiser';

export default class ArrayVisualiser extends Component {

    render() {
        const { data, indent, useHljs, name } = this.props;

        let items = [];
        for (let i = 0; i < data.length; i++) {
            var item = data[i];
            var VisualiserComponent = selectComponent(item);
            items.push(
                <VisualiserComponent
                    key={String(i)}
                    data={item}
                    name={String(i)}
                    indent={indent == 0 ? indent + 2 : indent + 1}
                    useHljs={useHljs}
                />
            );
        }

        let arrow;
        let spaces = getSpacing(indent);
        if (items.length > 0) {
            arrow = '\u25bc\u00a0';
            if (spaces.length >= 2) {
                // Space for arrow
                spaces = spaces.slice(2);
            }
        }
        const key = name ? name + ':\u00a0' : '';

        return (
            <div className="array-visualiser">
                <span className="visualiser-spacing">{spaces}</span>
                <span>{arrow}</span>
                <span>{key}</span>
                <span className={useHljs ? "hljs-keyword" : ""}>Array</span>
                <span>{'[' + items.length + ']'}</span>
                {items}
            </div>
        );

    }

}
