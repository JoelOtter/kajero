import { combineReducers } from 'redux';
import Immutable from 'immutable';
import parse from './parseMarkdown';
import {
    LOAD_MARKDOWN,
    EXECUTE
} from './actions';

const defaultNotebook = Immutable.fromJS({
    metadata: {
        title: 'New notebook',
        author: 'Kajero'
    },
    content: [],
    blocks: {}
});

function notebook(state = defaultNotebook, action) {
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown);
        case EXECUTE:
            const { id, code } = action;
            const newState = state.setIn(['blocks', id, 'hasBeenRun'], true);
            try {
                return newState.setIn(['blocks', id, 'result'], eval(code));
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
