import { combineReducers } from 'redux';
import Immutable from 'immutable';
import parse from './parseMarkdown';
import Smolder from 'smolder';
import Jutsu from 'jutsu'; // Import d3 and nv as globals
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
    var graphElement = document.getElementById("kajero-graph-" + id);
    var jutsu = Smolder(Jutsu(graphElement));
    return new Function(['d3', 'nv', 'graphs', 'data', 'graphElement'], code).call(
        context, d3, nv, jutsu, data, graphElement
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
                console.error(err);
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
