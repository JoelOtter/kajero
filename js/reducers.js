import { combineReducers } from 'redux';
import parse from './parseMarkdown';
import { LOAD_MARKDOWN } from './actions';

function notebook(state = {
    title: 'New notebook',
    author: 'Kajero',
    content: []
}, action) {
    switch (action.type) {
        case LOAD_MARKDOWN:
            return parse(action.markdown);
        default:
            return state;
    }
}

const reducer = combineReducers({
    notebook
});

export default reducer;
