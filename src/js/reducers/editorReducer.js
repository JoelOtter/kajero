import Immutable from 'immutable';
import { TOGGLE_EDIT } from '../actions';

/*
 * This reducer simply keeps track of the state of the editor.
 */
const defaultEditor = Immutable.Map({
    editable: false
});

export default function editor(state = defaultEditor, action) {
    switch (action.type) {
        case TOGGLE_EDIT:
            return state.set('editable', !state.get('editable'));
        default:
            return state;
    }
}
