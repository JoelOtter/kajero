import { combineReducers } from 'redux';

import notebook from './notebookReducer';
import execution from './executionReducer';
import editor from './editorReducer';

export default combineReducers({
    notebook,
    execution,
    editor
});

