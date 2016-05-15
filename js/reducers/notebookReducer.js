import Immutable from 'immutable';
import Jutsu from 'jutsu';
import { parse } from '../markdown';
import { kajeroHomepage } from '../config';
import {
    LOAD_MARKDOWN,
    UPDATE_BLOCK,
    UPDATE_META,
    TOGGLE_META,
    ADD_BLOCK,
    DELETE_BLOCK,
    MOVE_BLOCK_UP,
    MOVE_BLOCK_DOWN,
    DELETE_DATASOURCE,
    UPDATE_DATASOURCE,
    GIST_CREATED,
    UNDO,
    CHANGE_CODE_BLOCK_OPTION,
    UPDATE_GRAPH_BLOCK_PROPERTY,
    UPDATE_GRAPH_BLOCK_HINT,
    UPDATE_GRAPH_BLOCK_LABEL,
    CLEAR_GRAPH_BLOCK_DATA
} from '../actions';

/*
 * This reducer handles the state of the notebook's actual content,
 * obtained by parsing Markdown. This is kept separate from the execution
 * state to help with implementing 'undo' in the editor.
 */
export const initialState = Immutable.Map({
    metadata: Immutable.fromJS({
        datasources: {}
    }),
    content: Immutable.List(),
    blocks: Immutable.Map(),
    undoStack: Immutable.List()
});

export default function notebook(state = initialState, action) {
    const { id, text, field, blockType } = action;
    const content = state.get('content');
    let newState;
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown).mergeDeep(state);
        case UPDATE_BLOCK:
            return handleChange(
                state, state.setIn(['blocks', id, 'content'], text)
            );
        case UPDATE_META:
            return handleChange(
                state, state.setIn(['metadata', field], text)
            );
        case TOGGLE_META:
            return handleChange(
                state, state.setIn(['metadata', field], !state.getIn(['metadata', field]))
            );
        case ADD_BLOCK:
            const newId = getNewId(content);
            let newBlock = {type: blockType, id: newId};
            if (blockType === 'code') {
                newBlock.content = '// New code block';
                newBlock.language = 'javascript';
                newBlock.option = 'runnable';
            } else if (blockType === 'graph') {
                newBlock.language = 'javascript';
                newBlock.option = 'runnable';
                newBlock.content = 'return graphs.pieChart(data);';
                newBlock.graphType = 'pieChart';
                newBlock.dataPath = 'data';
                newBlock.hints = Immutable.fromJS({
                    label: '',
                    value: '',
                    x: '',
                    y: ''
                });
                newBlock.labels = Immutable.fromJS({
                    x: '',
                    y: ''
                });
            } else {
                newBlock.content = 'New text block';
            }
            newState = handleChange(
                state, state.setIn(['blocks', newId], Immutable.fromJS(newBlock))
            );
            if (id === undefined) {
                return newState.set('content', content.push(newId));
            }
            return newState.set('content', content.insert(content.indexOf(id), newId));
        case DELETE_BLOCK:
            return handleChange(
                state,
                state.deleteIn(['blocks', id]).set(
                    'content', content.delete(content.indexOf(id))
                )
            );
        case MOVE_BLOCK_UP:
            return handleChange(
                state, state.set('content', moveItem(content, id, true))
            );
        case MOVE_BLOCK_DOWN:
            return handleChange(
                state, state.set('content', moveItem(content, id, false))
            );
        case DELETE_DATASOURCE:
            return handleChange(
                state, state.deleteIn(['metadata', 'datasources', id])
            );
        case UPDATE_DATASOURCE:
            return handleChange(
                state, state.setIn(['metadata', 'datasources', id], text)
            );
        case GIST_CREATED:
            return state.setIn(['metadata', 'gistUrl'], kajeroHomepage + '?id=' + id);
        case UNDO:
            return undo(state);
        case CHANGE_CODE_BLOCK_OPTION:
            return handleChange(state, state.setIn(
                ['blocks', id, 'option'],
                getNewOption(state.getIn(['blocks', id, 'option']))
            ));
        case UPDATE_GRAPH_BLOCK_PROPERTY:
            newState = state.setIn(
                ['blocks', id, action.property], action.value
            );
            return handleChange(state, newState.setIn(
                ['blocks', id, 'content'],
                generateCode(newState.getIn(['blocks', id]))
            ));
        case UPDATE_GRAPH_BLOCK_HINT:
            newState = state.setIn(
                ['blocks', id, 'hints', action.hint], action.value
            );
            return handleChange(state, newState.setIn(
                ['blocks', id, 'content'],
                generateCode(newState.getIn(['blocks', id]))
            ));
        case UPDATE_GRAPH_BLOCK_LABEL:
            newState = state.setIn(
                ['blocks', id, 'labels', action.label], action.value
            );
            return handleChange(state, newState.setIn(
                ['blocks', id, 'content'],
                generateCode(newState.getIn(['blocks', id]))
            ));
        case CLEAR_GRAPH_BLOCK_DATA:
            return state.setIn(
                ['blocks', id],
                state.getIn(['blocks', id]).remove('hints')
                    .remove('graphType').remove('labels')
                    .remove('dataPath')
            );
        default:
            return state;
    }
}

function generateCode(block) {
    return 'return graphs.' + block.get('graphType') +
        '(' + block.get('dataPath') + getLabels(block) +
        getHints(block) + ');';
}

function getHints(block) {
    const hints = block.get('hints');
    const schema = Jutsu().__SMOLDER_SCHEMA[block.get('graphType')].data[0];
    const result = [];
    const keys = Object.keys(schema).sort();
    for (let i = 0; i < keys.length; i++) {
        const hint = keys[i];
        const value = hints.get(hint);
        if (value) {
            result.push(hint + ": '" + value + "'");
        }
    }
    if (result.length === 0) {
        return '';
    }
    return ', {' + result.join(', ') + '}';
}

function getLabels(block) {
    if (block.get('graphType') === 'pieChart') {
        return '';
    }
    const labels = block.get('labels');
    return ', ' +
        [labels.get('x'), labels.get('y')].map(
            (label) => "'" + label + "'"
        ).join(', ');
}

function getNewId(content) {
    var id = 0;
    while (content.contains(String(id))) {
        id++;
    }
    return String(id);
}

function getNewOption(option) {
    const options = ['runnable', 'auto', 'hidden'];
    const i = options.indexOf(option);
    return options[(i + 1) % options.length];
}

function moveItem(content, id, up) {
    const index = content.indexOf(id);
    if ((index === 0 && up) || (index === content.size - 1 && !up)) {
        return content;
    }
    if (up) {
        return content.slice(0, index - 1)
            .push(id).push(content.get(index-1))
            .concat(content.slice(index + 1));
    }
    return content.slice(0, index)
        .push(content.get(index + 1)).push(id)
        .concat(content.slice(index + 2));
}

/*
 * Handles changes, if they exist, by pushing to the undo stack.
 */
function handleChange(currentState, newState) {
    if (currentState.equals(newState)) {
        return newState;
    }
    let result = newState.set(
        'undoStack',
        newState.get('undoStack').push(currentState.remove('undoStack'))
    ).deleteIn(
        ['metadata', 'gistUrl']
    ).setIn(
        ['metadata', 'created'],
        new Date()
    );

    // If it's the first change, update the parent link.
    if (currentState.get('undoStack').size === 0) {
        result = result.setIn(['metadata', 'original'], Immutable.fromJS({
            title: currentState.getIn(['metadata', 'title']),
            url: location.href
        }));
    }
    return result;
}

function undo(state) {
    if (state.get('undoStack').size === 0) {
        return state;
    }
    return state.get('undoStack').last()
        .set('undoStack', state.get('undoStack').pop());
}
