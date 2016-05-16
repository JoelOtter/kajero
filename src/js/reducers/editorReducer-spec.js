import { expect } from 'chai';
import Immutable from 'immutable';
import * as actions from '../actions';
import reducer from './editorReducer';

describe('editor reducer', () => {

    it('should do nothing for an unhandled action type', () => {
        expect(reducer(Immutable.Map({editable: false}), {type: 'FAKE_ACTION'}))
            .to.eql(Immutable.Map({editable: false}));
    });

    it('should toggle editor state for TOGGLE_EDIT', () => {
        expect(
            reducer(
                Immutable.Map({editable: false}),
                {type: actions.TOGGLE_EDIT}
            ).equals(Immutable.Map({editable: true}))
        ).to.be.true;
        expect(
            reducer(
                Immutable.Map({editable: true}),
                {type: actions.TOGGLE_EDIT}
            ).equals(Immutable.Map({editable: false}))
        ).to.be.true;
    });

    it('should return the inital state', () => {
        expect(reducer(undefined, {})).to.eql(Immutable.Map({
            editable: false,
            saving: false,
            activeBlock: null
        }));
    });

    it('should toggle save state for TOGGLE_SAVE', () => {
        expect(
            reducer(
                Immutable.Map({saving: false}),
                {type: actions.TOGGLE_SAVE}
            ).equals(Immutable.Map({saving: true}))
        ).to.be.true;
        expect(
            reducer(
                Immutable.Map({saving: true}),
                {type: actions.TOGGLE_SAVE}
            ).equals(Immutable.Map({saving: false}))
        ).to.be.true;
    });

    it('should set the editing block on EDIT_BLOCK', () => {
        expect(reducer(
            Immutable.Map({activeBlock: null}),
            {type: actions.EDIT_BLOCK, id: '12'}
        ).equals(Immutable.Map({activeBlock: '12'}))).to.be.true;
    });

});
