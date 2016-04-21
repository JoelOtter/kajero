import Immutable from 'immutable';
import parse from '../parseMarkdown';
import {
    LOAD_MARKDOWN,
    TOGGLE_EDIT,
    UPDATE_BLOCK,
    UPDATE_META,
    TOGGLE_META,
    ADD_BLOCK,
    DELETE_BLOCK,
    MOVE_BLOCK_UP,
    MOVE_BLOCK_DOWN,
    DELETE_DATASOURCE,
    UPDATE_DATASOURCE
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
    blocks: Immutable.Map()
});

export default function notebook(state = initialState, action) {
    const { id, text, field, blockType } = action;
    const content = state.get('content');
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown).mergeDeep(state);
        case UPDATE_BLOCK:
            return state.setIn(['blocks', id, 'content'], text);
        case UPDATE_META:
            return state.setIn(['metadata', field], text);
        case TOGGLE_META:
            return state.setIn(['metadata', field], !state.getIn(['metadata', field]));
        case TOGGLE_EDIT:
            return state.setIn(['metadata', 'created'], new Date().toUTCString());
        case ADD_BLOCK:
            const newId = getNewId(content);
            let newBlock = {type: blockType, id: newId};
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
        case DELETE_BLOCK:
            return state.deleteIn(['blocks', id])
                .set('content', content.delete(content.indexOf(id)));
        case MOVE_BLOCK_UP:
            return state.set('content', moveItem(content, id, true));
        case MOVE_BLOCK_DOWN:
            return state.set('content', moveItem(content, id, false));
        case DELETE_DATASOURCE:
            return state.deleteIn(['metadata', 'datasources', id]);
        case UPDATE_DATASOURCE:
            return state.setIn(['metadata', 'datasources', id], text);
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
