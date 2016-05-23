import Immutable from 'immutable';
import { expect } from 'chai';
import jsdom from 'mocha-jsdom';
import reducer, { initialState } from './executionReducer';
import * as actions from '../actions';

describe('execution reducer', () => {

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

    it('should clear block results and executed state on update', () => {
        const action = {
            type: actions.UPDATE_BLOCK,
            id: '12'
        };
        const beforeState = initialState
            .setIn(['results', '12'], 120)
            .set('blocksExecuted', initialState.get('blocksExecuted').add('12'));
        expect(reducer(beforeState, action).toJS()).to.eql(initialState.toJS());
    });

    it('should clear block results and executed state on update', () => {
        const action = {
            type: actions.DELETE_BLOCK,
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

    it('should clear datasource data when the datasource is updated', () => {
        const action = {
            type: actions.UPDATE_DATASOURCE,
            id: 'github'
        };
        const beforeState = initialState.setIn(['data', 'github', 'repos'], 12);
        expect(reducer(beforeState, action).toJS()).to.eql(initialState.toJS());
    });

    it('should update result, executed and context on CODE_EXECUTED', () => {
        const action = {
            type: actions.CODE_EXECUTED,
            id: '99',
            data: 3,
            context: Immutable.Map({number: 10})
        };
        const expected = initialState.setIn(
            ['results', '99'], 3
        ).set(
            'blocksExecuted', initialState.get('blocksExecuted').add('99')
        ).set(
            'executionContext', Immutable.Map({number: 10})
        );
        expect(reducer(initialState, action).toJS()).to.eql(expected.toJS());
    });

    it('should update result and executed on CODE_ERROR', () => {
        const action = {
            type: actions.CODE_ERROR,
            id: '99',
            data: 'Some error'
        };
        const expected = initialState.setIn(
            ['results', '99'], 'Some error'
        ).set(
            'blocksExecuted', initialState.get('blocksExecuted').add('99')
        );
        expect(reducer(initialState, action).toJS()).to.eql(expected.toJS());
    });

});
