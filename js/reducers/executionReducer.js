import Immutable from 'immutable';
import Smolder from 'smolder';
import Jutsu from 'jutsu'; // Imports d3 and nv as globals
import {
    RECEIVED_DATA,
    EXECUTE,
    UPDATE_BLOCK,
    DELETE_DATASOURCE,
    UPDATE_DATASOURCE
} from '../actions';


/*
 * This reducer handles the state of execution of code blocks -
 * retaining results, carrying context around, and making note
 * of which blocks have and haven't been executed. It's also
 * where the obtained data is stored.
 */
export const initialState = Immutable.Map({
    executionContext: Immutable.Map(),
    data: Immutable.Map(),
    results: Immutable.Map(),
    blocksExecuted: Immutable.Set()
});

export default function execution(state = initialState, action) {
    const { id, code, text, name, data } = action;
    switch (action.type) {
        case EXECUTE:
            try {
                const context = state.get('executionContext').toJS();
                const data = state.get('data').toJS();
                return state
                    .setIn(['results', id], executeCode(code, context, data, id))
                    .set('blocksExecuted', state.get('blocksExecuted').add(id))
                    .set('executionContext', Immutable.fromJS(context));
            } catch (err) {
                return state
                    .setIn(['results', id], err)
                    .set('blocksExecuted', state.get('blocksExecuted').add(id));
            }
        case RECEIVED_DATA:
            return state.setIn(['data', name], Immutable.fromJS(data));
        case UPDATE_BLOCK:
            return state
                .set('blocksExecuted', state.get('blocksExecuted').remove(id))
                .removeIn(['results', id]);
        case UPDATE_DATASOURCE:
        case DELETE_DATASOURCE:
            return state.deleteIn(['data', id]);
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