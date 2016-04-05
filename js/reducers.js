import { combineReducers } from 'redux';
import Immutable from 'immutable';
import parse from './parseMarkdown';
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

function notebook(state = defaultNotebook, action) {
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown);
        case EXECUTE:
            const { id, code } = action;
            const newState = state.setIn(['blocks', id, 'hasBeenRun'], true);
            try {
                let context = state.get('executionContext');
                return newState.setIn(
                    ['blocks', id, 'result'], Function(code).call(context)
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
