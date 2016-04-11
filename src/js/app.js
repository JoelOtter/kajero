import 'whatwg-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import NotebookReducer from './reducers';
import Notebook from './Notebook';

const store = compose(
    applyMiddleware(thunk)
)(createStore)(NotebookReducer);

render(
    <Provider store={store}>
        <div>
            <Notebook />
        </div>
    </Provider>,
    document.getElementById('kajero')
);
