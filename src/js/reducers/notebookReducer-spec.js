import Immutable from 'immutable';
import { expect } from 'chai';
import sinon from 'sinon';
import reducer, { initialState } from './notebookReducer';
import * as markdown from '../markdown';
import * as actions from '../actions';
import { kajeroHomepage } from '../config';

describe('notebook reducer', () => {

    it('should return the initial state', () => {
        expect(reducer(undefined, {}).toJS()).to.eql(initialState.toJS());
    });

    describe('metadata', () => {

        let clock;

        before(() => {
            clock = sinon.useFakeTimers();
        });

        after(() => {
            clock.restore();
        });

        it('should update metadata on UPDATE_META', () => {
            const action = {
                type: actions.UPDATE_META,
                field: 'title',
                text: 'New Title'
            };
            const expectedState = initialState.setIn(
                ['metadata', 'title'], 'New Title'
            ).set(
                'undoStack', Immutable.List([initialState.remove('undoStack')])
            );
            expect(reducer(initialState, action).toJS()).to.eql(expectedState.toJS());
        });

        it('should correctly delete datasources on DELETE_DATASOURCE', () => {
            const action = {
                type: actions.DELETE_DATASOURCE,
                id: 'facebook'
            };
            const beforeState = initialState.setIn(
                ['metadata', 'datasources', 'facebook'], 'http://www.facebook.com'
            ).setIn(
                ['metadata', 'datasources', 'github'], 'http://github.com'
            );
            const afterState = initialState.setIn(
                ['metadata', 'datasources', 'github'], 'http://github.com'
            ).set(
                'undoStack', Immutable.List([
                    beforeState.remove('undoStack')
                ])
            );
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should correctly update a datasource on UPDATE_DATASOURCE', () => {
            const action = {
                type: actions.UPDATE_DATASOURCE,
                id: 'facebook',
                text: 'http://www.facebook.com'
            };
            const beforeState = initialState.setIn(
                ['metadata', 'datasources', 'facebook'], 'http://github.com'
            );
            const afterState = initialState.setIn(
                ['metadata', 'datasources', 'facebook'], 'http://www.facebook.com'
            ).set(
                'undoStack', Immutable.List([
                    beforeState.remove('undoStack')
                ])
            );
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should correctly toggle metadata items', () => {
            const beforeState = initialState.setIn(['metadata', 'showFooter'], false);
            const afterState = initialState.setIn(
                ['metadata', 'showFooter'], true
            ).set(
                'undoStack', Immutable.List([
                    beforeState.remove('undoStack')
                ])
            );

            const action = {
                type: actions.TOGGLE_META,
                field: 'showFooter'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should update the date when edit mode is toggled', () => {
            const dateFirst = new Date().toUTCString();
            const action = {
                type: actions.TOGGLE_EDIT
            };
            const betweenState = initialState.setIn(['metadata', 'created'], dateFirst);
            expect(reducer(initialState, action).toJS()).to.eql(betweenState.toJS());

            clock.tick(500);
            const dateSecond = new Date().toUTCString();
            const afterState = initialState.setIn(['metadata', 'created'], dateSecond);
            expect(reducer(betweenState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should update the gist url after creation', () => {
            const action = {
                type: actions.GIST_CREATED,
                id: 'test_id'
            };
            const expected = initialState.setIn(
                ['metadata', 'gistUrl'],
                kajeroHomepage + '?id=test_id'
            );
            expect(reducer(initialState, action).toJS()).to.eql(expected.toJS());
        });

    });

    describe('blocks', () => {

        const exampleTextBlock = Immutable.fromJS({
            id: '0',
            type: 'text',
            content: '##Hello!\nThis is a text block.'
        });

        const exampleCodeBlock = Immutable.fromJS({
            id: '1',
            type: 'code',
            content: 'return "Hello, world!";',
            language: 'javascript',
            attrs: []
        });

        it('should move a block up on MOVE_BLOCK_UP', () => {
            const beforeState = initialState.set('content', Immutable.List(['1', '2', '3']));
            const afterState = initialState.set(
                'content', Immutable.List(['2', '1', '3'])
            ).set(
                'undoStack',
                Immutable.List([
                    beforeState.remove('undoStack')
                ])
            );
            const action = {
                type: actions.MOVE_BLOCK_UP,
                id: '2'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should do nothing on MOVE_BLOCK_UP with first block', () => {
            const beforeState = initialState.set('content', Immutable.List(['1', '2', '3']));
            const action = {
                type: actions.MOVE_BLOCK_UP,
                id: '1'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(beforeState.toJS());
        });

        it('should move a block down on MOVE_BLOCK_DOWN', () => {
            const beforeState = initialState.set('content', Immutable.List(['1', '2', '3']));
            const afterState = initialState.set(
                'content', Immutable.List(['1', '3', '2'])
            ).set(
                'undoStack',
                Immutable.List([
                    beforeState.remove('undoStack')
                ])
            );
            const action = {
                type: actions.MOVE_BLOCK_DOWN,
                id: '2'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should do nothing on MOVE_BLOCK_DOWN with last block', () => {
            const beforeState = initialState.set('content', Immutable.List(['1', '2', '3']));
            const action = {
                type: actions.MOVE_BLOCK_DOWN,
                id: '3'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(beforeState.toJS());
        });

        it('should delete a block with given id on DELETE_BLOCK', () => {
            const beforeState = initialState
                .set('content', Immutable.List(['1', '2', '3']))
                .set('blocks', Immutable.Map({
                    '1': {data: 'one'},
                    '2': {data: 'two'},
                    '3': {data: 'three'}
                }));
            const afterState = initialState
                .set('content', Immutable.List(['1', '3']))
                .set('blocks', Immutable.Map({
                    '1': {data: 'one'},
                    '3': {data: 'three'}
                }))
                .set(
                    'undoStack',
                    Immutable.List([
                        beforeState.remove('undoStack')
                    ])
                );
            const action = {
                type: actions.DELETE_BLOCK,
                id: '2'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should update only block text on UPDATE_BLOCK', () => {
            const newCode = 'return 1 + 2 * 7;';
            const beforeState = initialState
                .set('blocks', Immutable.Map({
                    '0': exampleTextBlock,
                    '1': exampleCodeBlock
                }))
                .set('content', Immutable.List(['0', '1']));
            const afterState = beforeState
                .setIn(['blocks', '1', 'content'], newCode)
                .set(
                    'undoStack',
                    Immutable.List([
                        beforeState.remove('undoStack')
                    ])
                );
            const action = {
                type: actions.UPDATE_BLOCK,
                id: '1',
                text: newCode
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should create a new block before the block with provided id', () => {
            const beforeState = initialState
                .setIn(['blocks', '0'], exampleTextBlock)
                .set('content', Immutable.List(['0']));
            const afterState = beforeState
                .setIn(
                    ['blocks', '1'],
                    exampleCodeBlock.set('content', '// New code block')
                )
                .set('content', ['1', '0'])
                .set(
                    'undoStack',
                    Immutable.List([
                        beforeState.remove('undoStack')
                    ])
                );
            const action = {
                type: actions.ADD_BLOCK,
                blockType: 'code',
                id: '0'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should push the new block to the end if no id is given', () => {
            const beforeState = initialState
                .set('blocks', Immutable.Map({
                    '0': exampleTextBlock,
                    '1': exampleCodeBlock
                }))
                .set('content', Immutable.List(['0', '1']));
            const afterState = initialState
                .set('blocks', Immutable.Map({
                    '0': exampleTextBlock,
                    '1': exampleCodeBlock,
                    '2': Immutable.fromJS({
                        type: 'text',
                        id: '2',
                        content: 'New text block'
                    })
                }))
                .set('content', Immutable.List(['0', '1', '2']))
                .set(
                    'undoStack',
                    Immutable.List([
                        beforeState.remove('undoStack')
                    ])
                );
            const action = {
                type: actions.ADD_BLOCK,
                id: undefined,
                blockType: 'text'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should clear the gist url on any change', () => {
            const beforeState = initialState.setIn(
                ['metadata', 'gistUrl'],
                'http://testgisturl.com'
            );
            const afterState = initialState.setIn(
                ['metadata', 'showFooter'], true
            ).set('undoStack', Immutable.List([
                beforeState.remove('undoStack')
            ]));
            const action = {
                type: actions.TOGGLE_META,
                field: 'showFooter'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

    });

    describe('markdown loading', () => {

        const parsed = Immutable.fromJS({
            metadata: {
                title: 'Test notebook',
                author: 'Mr McTest',
                created: new Date().toUTCString(),
                showFooter: true,
                datasources: {
                    github: 'http://github.com'
                },
                original: {
                    title: 'Blank Kajero notebook',
                    url: 'http://joelotter.com/kajero/blank'
                }
            },
            content: ['1'],
            blocks: {
                '1': {
                    type: 'text',
                    id: '1',
                    content: 'This is a blank text block'
                }
            },
            undoStack: []
        });

        before(() => {
            sinon.stub(markdown, "parse").returns(parsed);
        });

        after(() => {
            markdown.parse.restore()
        });

        it('should merge in parsed notebook', () => {
            const action = {
                type: actions.LOAD_MARKDOWN,
                markdown: ''
            };
            expect(reducer(initialState, action).toJS()).to.eql(parsed.toJS());
        });

    });

    describe('undo', () => {

        it('should correctly change to the previous state', () => {
            const action1 = {
                type: actions.ADD_BLOCK,
                blockType: 'text',
                id: '12'
            };
            const action2 = {
                type: actions.UNDO
            };
            expect(reducer(
                reducer(initialState, action1),
                action2
            ).toJS()).to.eql(initialState.toJS());
        });

        it('should do nothing if in initial state', () => {
            const action = {
                type: actions.UNDO
            };
            expect(reducer(initialState, action).toJS()).to.eql(initialState.toJS());
        });

    });

});
