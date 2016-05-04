import Immutable from 'immutable';
import reshaper from 'reshaper';
import Smolder from 'smolder';
import Jutsu from 'jutsu'; // Imports d3 and nv as globals
import {
    RECEIVED_DATA,
    EXECUTE,
    UPDATE_BLOCK,
    DELETE_DATASOURCE,
    UPDATE_DATASOURCE,
    EXECUTE_AUTO
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
            return executeBlock(state, id, code);
        case RECEIVED_DATA:
            return state.setIn(['data', name], Immutable.fromJS(data));
        case UPDATE_BLOCK:
            return state
                .set('blocksExecuted', state.get('blocksExecuted').remove(id))
                .removeIn(['results', id]);
        case UPDATE_DATASOURCE:
        case DELETE_DATASOURCE:
            return state.deleteIn(['data', id]);
        case EXECUTE_AUTO:
            return executeAuto(state, action.blocks, action.content);
        default:
            return state;
    }
}

function executeCode(code, context, data, id) {
    var graphElement = document.getElementById("kajero-graph-" + id);
    var jutsu = Smolder(Jutsu(graphElement));
    return new Function(
        ['d3', 'nv', 'graphs', 'data', 'reshaper', 'graphElement'], code
    ).call(
        context, d3, nv, jutsu, data, reshaper, graphElement
    );
}

function executeBlock(state, id, code) {
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
}

function executeAuto(state, blocks, blockOrder) {
    let newState = state;
    const orderedBlocks = blockOrder.map(
        (i) => blocks.get(i)
    ).filter(
        (block) => {
            const option = block.get('option');
            return block.get('type') === 'code' && (
                option === 'auto' || option === 'hidden'
            );
        }
    );
    orderedBlocks.forEach((block) => {
        newState = executeBlock(newState, block.get('id'), block.get('content'));
    });
    return newState;
}
