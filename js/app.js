import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import NotebookReducer from './reducers';
import Notebook from './Notebook';

let store = createStore(NotebookReducer);

render(
    <Provider store={store}>
        <div>
            <Notebook />
        </div>
    </Provider>,
    document.getElementById('kajero')
);
