import { combineReducers } from 'redux';
import Immutable from 'immutable';
import parse from './parseMarkdown';
import Smolder from 'smolder';
import Jutsu from 'jutsu'; // Imports d3 and nv as globals
import {
    LOAD_MARKDOWN,
    RECEIVED_DATA,
    EXECUTE,
    TOGGLE_EDIT,
    UPDATE_BLOCK,
    UPDATE_META,
    TOGGLE_META,
    ADD_BLOCK
} from './actions';


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

function execution(state = defaultExecutionState, action) {
    const { id, code, text, name, data } = action;
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
            const stateData = state.get('data');
            stateData[name] = data;
            return state.set(data, stateData);
        case UPDATE_BLOCK:
            return state
                .set('blocksExecuted', state.get('blocksExecuted').remove(id))
                .removeIn(['results', id]);
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

/*
 * This reducer handles the state of the notebook's actual content,
 * obtained by parsing Markdown. This is kept separate from the execution
 * state to help with implementing 'undo' in the editor.
 */
const defaultNotebook = Immutable.Map({
    metadata: Immutable.fromJS({
        datasources: {}
    }),
    content: Immutable.List(),
    blocks: Immutable.Map()
});

function notebook(state = defaultNotebook, action) {
    const { id, text, field, blockType } = action;
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown).mergeDeep(state);
        case UPDATE_BLOCK:
            console.log('updated ' + id);
            return state.setIn(['blocks', id, 'content'], text);
        case UPDATE_META:
            return state.setIn(['metadata', field], text);
        case TOGGLE_META:
            return state.setIn(['metadata', field], !state.getIn(['metadata', field]));
        case TOGGLE_EDIT:
            return state.setIn(['metadata', 'created'], new Date().toUTCString());
        case ADD_BLOCK:
            const content = state.get('content');
            const newId = getNewId(content);
            let newBlock = {type: blockType, id: newId};
            console.log('created ' + newId);
            if (blockType === 'code') {
                newBlock.content = '// New code block';
                newBlock.language = 'javascript';
                newBlock.attrs = [];
            } else {
                newBlock.content = 'New text block';
            }
            const newState = state.setIn(['blocks', newId], Immutable.fromJS(newBlock));
            if (id === undefined) {
                return newState.set('content', content.push(newId));
            }
            return newState.set('content', content.insert(content.indexOf(id), newId));
        default:
            return state;
    }
}

function getNewId(content) {
    var id = 0;
    while (content.contains(String(id))) {
        id++;
    }
    return String(id);
}

/*
 * This reducer simply keeps track of the state of the editor.
 */
const defaultEditor = Immutable.Map({
    editable: false
});

function editor(state = defaultEditor, action) {
    switch (action.type) {
        case TOGGLE_EDIT:
            return state.set('editable', !state.get('editable'));
        default:
            return state;
    }
}

const reducer = combineReducers({
    notebook,
    execution,
    editor
});

export default reducer;
