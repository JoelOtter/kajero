import Immutable from 'immutable';
import { expect } from 'chai';
import jsdom from 'mocha-jsdom';
import reducer, { initialState } from './executionReducer';
import * as actions from '../actions';

describe('execution reducer', () => {

    // Mock stuff for execution
    jsdom();
    global.nv = {};

    it('should return the initial state', () => {
        expect(reducer(undefined, {})).to.eql(initialState);
    });

    it('should update the data on received data', () => {
        const action = {
            type: actions.RECEIVED_DATA,
            name: 'github',
            data: {repos: 12}
        };
        const newState = initialState.setIn(['data', 'github', 'repos'], 12);
        expect(reducer(initialState, action).toJS()).to.eql(newState.toJS());
    });

    it('should clear block data and set execution state on update', () => {
        const action = {
            type: actions.UPDATE_BLOCK,
            id: '12'
        };
        const beforeState = initialState
            .setIn(['results', '12'], 120)
            .set('blocksExecuted', initialState.get('blocksExecuted').add('12'));
        expect(reducer(beforeState, action).toJS()).to.eql(initialState.toJS());
    });

    it('should clear datasource data when the datasource is deleted', () => {
        const action = {
            type: actions.DELETE_DATASOURCE,
            id: 'github'
        };
        const beforeState = initialState.setIn(['data', 'github', 'repos'], 12);
        expect(reducer(beforeState, action).toJS()).to.eql(initialState.toJS());
    });

    it('should save results and mark execution on EXECUTE action', () => {
        const id = '1';
        const code = 'return 12 + 5;';
        const action = {
            type: actions.EXECUTE,
            id,
            code
        };
        const expectedState = initialState
            .setIn(['results', id], 17)
            .set('blocksExecuted', initialState.get('blocksExecuted').add(id));
        expect(reducer(initialState, action).toJS()).to.eql(expectedState.toJS());
    });

    it('should save errors as the result', () => {
        const id = '1';
        const code = 'return 5 ++ 3;';
        let result;
        try {
            eval(code);
        } catch (err) {
            result = err;
        }
        const action = {
            type: actions.EXECUTE,
            id,
            code
        };
        const expectedState = initialState
            .setIn(['results', id], result)
            .set('blocksExecuted', initialState.get('blocksExecuted').add(id));
        expect(reducer(initialState, action).toJS()).to.eql(expectedState.toJS());

    });

});
