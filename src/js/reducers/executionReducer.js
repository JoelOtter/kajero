import Immutable from 'immutable';
import Smolder from 'smolder';
import Jutsu from 'jutsu'; // Imports d3 and nv as globals
import {
    RECEIVED_DATA,
    EXECUTE,
    UPDATE_BLOCK,
    DELETE_DATASOURCE
} from '../actions';


/*
 * This reducer handles the state of execution of code blocks -
 * retaining results, carrying context around, and making note
 * of which blocks have and haven't been executed. It's also
 * where the obtained data is stored.
 */
const defaultExecutionState = Immutable.Map({
    executionContext: {},
    data: {},
    results: Immutable.Map(),
    blocksExecuted: Immutable.Set()
});

export default function execution(state = defaultExecutionState, action) {
    const { id, code, text, name, data } = action;
    const stateData = state.get('data');
    switch (action.type) {
        case EXECUTE:
            try {
                let context = state.get('executionContext');
                const data = state.get('data');
                const newState = state.set(
                    'blocksExecuted', state.get('blocksExecuted').add(id)
                );
                return newState
                    .setIn(['results', id], executeCode(code, context, data, id))
                    .set('executionContext', context);
            } catch (err) {
                console.error(err);
                return newState
                    .setIn(['results', id], err);
            }
        case RECEIVED_DATA:
            stateData[name] = data;
            return state.set('data', stateData);
        case UPDATE_BLOCK:
            return state
                .set('blocksExecuted', state.get('blocksExecuted').remove(id))
                .removeIn(['results', id]);
        case DELETE_DATASOURCE:
            delete stateData[id];
            return state.set('data', stateData);
        default:
            return state;
    }
}

function executeCode(code, context, data, id) {
    var graphElement = document.getElementById("kajero-graph-" + id);
    var jutsu = Smolder(Jutsu(graphElement));
    return new Function(['d3', 'nv', 'graphs', 'data', 'graphElement'], code).call(
        context, d3, nv, jutsu, data, graphElement
    );
}
