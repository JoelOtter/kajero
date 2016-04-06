import { combineReducers } from 'redux';
import Immutable from 'immutable';
import parse from './parseMarkdown';
import nv from 'nvd3';
import {
    LOAD_MARKDOWN,
    EXECUTE
} from './actions';

const defaultNotebook = Immutable.Map({
    metadata: Immutable.Map({
        title: 'New notebook',
        author: 'Kajero'
    }),
    content: Immutable.List(),
    blocks: Immutable.Map(),
    executionContext: {}
});

function executeCode(code, context, id) {
    return new Function(['d3', 'nv', 'graphElement'], code).call(
        context, d3, nv, document.getElementById("kajero-graph-" + id)
    );
}

function notebook(state = defaultNotebook, action) {
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown).mergeDeep(state);
        case EXECUTE:
            const { id, code } = action;
            const newState = state.setIn(['blocks', id, 'hasBeenRun'], true);
            try {
                let context = state.get('executionContext');
                return newState.setIn(
                    ['blocks', id, 'result'], executeCode(code, context, id)
                ).set(
                    'executionContext', context
                );
            } catch (err) {
                return newState.setIn(['blocks', id, 'result'], err);
            }
        default:
            return state;
    }
}

const reducer = combineReducers({
    notebook
});

export default reducer;
