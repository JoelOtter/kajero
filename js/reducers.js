import { combineReducers } from 'redux';
import Immutable from 'immutable';
import parse from './parseMarkdown';
import nv from 'nvd3';
import {
    LOAD_MARKDOWN,
    RECEIVED_DATA,
    EXECUTE
} from './actions';

const defaultNotebook = Immutable.Map({
    metadata: Immutable.fromJS({
        datasources: {}
    }),
    content: Immutable.List(),
    blocks: Immutable.Map(),
    data: {},
    executionContext: {}
});

function executeCode(code, context, data, id) {
    return new Function(['d3', 'nv', 'data', 'graphElement'], code).call(
        context, d3, nv, data, document.getElementById("kajero-graph-" + id)
    );
}

function notebook(state = defaultNotebook, action) {
    // TODO split this out into functions...serious
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown).mergeDeep(state);
        case EXECUTE:
            const { id, code } = action;
            const newState = state.setIn(['blocks', id, 'hasBeenRun'], true);
            try {
                let context = state.get('executionContext');
                const data = state.get('data');
                return newState.setIn(
                    ['blocks', id, 'result'], executeCode(code, context, data, id)
                ).set(
                    'executionContext', context
                );
            } catch (err) {
                return newState.setIn(['blocks', id, 'result'], err);
            }
        case RECEIVED_DATA:
            const { name, data } = action;
            const stateData = state.get('data');
            stateData[name] = data;
            return state.set('data', stateData);
        default:
            return state;
    }
}

const reducer = combineReducers({
    notebook
});

export default reducer;
