import Immutable from 'immutable';
import { expect } from 'chai';
import sinon from 'sinon';
import reducer, { initialState } from './notebookReducer';
import * as markdown from '../markdown';
import * as actions from '../actions';
import { kajeroHomepage } from '../config';

function handleFirstChange(state) {
    return state.set(
        'undoStack', Immutable.List([state.remove('undoStack')])
    ).setIn(
        ['metadata', 'created'],
        new Date()
    ).setIn(
        ['metadata', 'original'],
        Immutable.fromJS({
            title: undefined,
            url: undefined
        })
    );
}

describe('notebook reducer', () => {

    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should return the initial state', () => {
        expect(reducer(undefined, {}).toJS()).to.eql(initialState.toJS());
    });

    describe('metadata', () => {

        it('should update metadata on UPDATE_META', () => {
            const action = {
                type: actions.UPDATE_META,
                field: 'title',
                text: 'New Title'
            };
            const expectedState = handleFirstChange(initialState).setIn(
                ['metadata', 'title'], 'New Title'
            );
            const result = reducer(initialState, action).toJS();
            expect(result).to.eql(expectedState.toJS());
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
            const afterState = handleFirstChange(beforeState).deleteIn(
                ['metadata', 'datasources', 'facebook']
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
            const afterState = handleFirstChange(beforeState).setIn(
                ['metadata', 'datasources', 'facebook'], 'http://www.facebook.com'
            );
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should correctly toggle metadata items', () => {
            const beforeState = initialState.setIn(['metadata', 'showFooter'], false);
            const afterState = handleFirstChange(beforeState).setIn(
                ['metadata', 'showFooter'], true
            );

            const action = {
                type: actions.TOGGLE_META,
                field: 'showFooter'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
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

        it('should only update the parent link on first change', () => {
            const beforeState = handleFirstChange(initialState).setIn(
                ['metadata', 'title'],
                'Test Title'
            );
            const action = {
                type: actions.TOGGLE_META,
                field: 'showFooter'
            }
            const result = reducer(beforeState, action).getIn(['metadata', 'original']);
            expect(result).to.eql(beforeState.getIn(['metadata', 'original']));
        });

        it('should update the date on every change', () => {
            const beforeState = handleFirstChange(initialState).setIn(
                ['metadata', 'title'],
                'Test Title'
            );
            clock.tick(50000);
            const afterState = beforeState.setIn(
                ['metadata', 'title'],
                'New Title'
            ).setIn(
                ['metadata', 'created'],
                new Date()
            ).set(
                'undoStack',
                beforeState.get('undoStack').push(beforeState.remove('undoStack'))
            );
            const action = {
                type: actions.UPDATE_META,
                field: 'title',
                text: 'New Title'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should clear the gist url on any change', () => {
            const beforeState = initialState.setIn(
                ['metadata', 'gistUrl'],
                'http://testgisturl.com'
            );
            const afterState = handleFirstChange(beforeState).setIn(
                ['metadata', 'showFooter'], true
            ).removeIn(['metadata', 'gistUrl']);
            const action = {
                type: actions.TOGGLE_META,
                field: 'showFooter'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
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
            option: 'runnable'
        });

        it('should move a block up on MOVE_BLOCK_UP', () => {
            const beforeState = initialState.set('content', Immutable.List(['1', '2', '3']));
            const afterState = handleFirstChange(beforeState).set(
                'content', Immutable.List(['2', '1', '3'])
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
            const afterState = handleFirstChange(beforeState).set(
                'content', Immutable.List(['1', '3', '2'])
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
            const afterState = handleFirstChange(beforeState)
                .set('content', Immutable.List(['1', '3']))
                .set('blocks', Immutable.Map({
                    '1': {data: 'one'},
                    '3': {data: 'three'}
                }));
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
            const afterState = handleFirstChange(beforeState)
                .setIn(['blocks', '1', 'content'], newCode);
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
            const afterState = handleFirstChange(beforeState)
                .setIn(
                    ['blocks', '1'],
                    exampleCodeBlock.set('content', '// New code block')
                )
                .set('content', ['1', '0']);
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
            const afterState = handleFirstChange(beforeState)
                .setIn(['blocks', '2'], Immutable.Map({
                    type: 'text',
                    id: '2',
                    content: 'New text block'
                }))
                .set('content', Immutable.List(['0', '1', '2']));
            const action = {
                type: actions.ADD_BLOCK,
                id: undefined,
                blockType: 'text'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should change a runnable block to auto on option change', () => {
            const beforeState = initialState.setIn(
                ['blocks', '12'], Immutable.Map({
                    option: 'runnable'
                })
            );
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '12', 'option'], 'auto'
            );
            const action = {
                type: actions.CHANGE_CODE_BLOCK_OPTION,
                id: '12'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should change an auto block to hidden on option change', () => {
            const beforeState = initialState.setIn(
                ['blocks', '12'], Immutable.Map({
                    option: 'auto'
                })
            );
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '12', 'option'], 'hidden'
            );
            const action = {
                type: actions.CHANGE_CODE_BLOCK_OPTION,
                id: '12'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should change a hidden block to runnable on option change', () => {
            const beforeState = initialState.setIn(
                ['blocks', '12'], Immutable.Map({
                    option: 'hidden'
                })
            );
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '12', 'option'], 'runnable'
            );
            const action = {
                type: actions.CHANGE_CODE_BLOCK_OPTION,
                id: '12'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should change an optionless block to runnable on option change', () => {
            const beforeState = initialState.setIn(
                ['blocks', '12'], Immutable.Map({
                    option: undefined
                })
            );
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '12', 'option'], 'runnable'
            );
            const action = {
                type: actions.CHANGE_CODE_BLOCK_OPTION,
                id: '12'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should correctly create a graph block', () => {
            const action = {
                type: actions.ADD_BLOCK,
                id: undefined,
                blockType: 'graph'
            };
            const expected = handleFirstChange(initialState).setIn(
                ['blocks', '0'], Immutable.fromJS({
                    id: '0',
                    type: 'graph',
                    language: 'javascript',
                    option: 'runnable',
                    graphType: 'pieChart',
                    dataPath: 'data',
                    content: 'return graphs.pieChart(data);',
                    hints: {
                        x: '', y: '', label: '', value: ''
                    },
                    labels: {x: '', y: ''}
                })
            ).set('content', Immutable.List(['0']));
            expect(reducer(initialState, action).toJS()).to.eql(expected.toJS());
        });

        it('should clear a graph block on CLEAR_GRAPH_BLOCK_DATA', () => {
            const beforeState = initialState.setIn(
                ['blocks', '0'], Immutable.fromJS({
                    id: '0',
                    type: 'code',
                    language: 'javascript',
                    option: 'runnable',
                    graphType: 'pieChart',
                    dataPath: 'data',
                    content: 'return graphs.pieChart(data);',
                    hints: {
                        x: '', y: '', label: '', value: ''
                    },
                    labels: {x: '', y: ''}
                })
            ).set('content', Immutable.List(['0']));
            const afterState = beforeState.setIn(
                ['blocks', '0'], Immutable.fromJS({
                    id: '0',
                    type: 'code',
                    content: 'return graphs.pieChart(data);',
                    language: 'javascript',
                    option: 'runnable'
                })
            );
            const action = {
                type: actions.CLEAR_GRAPH_BLOCK_DATA,
                id: '0'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should regenerate code on graph type change', () => {
            const beforeState = initialState.setIn(
                ['blocks', '0'], Immutable.fromJS({
                    id: '0',
                    type: 'graph',
                    language: 'javascript',
                    option: 'runnable',
                    graphType: 'pieChart',
                    dataPath: 'data',
                    content: 'return graphs.pieChart(data);',
                    hints: {
                        x: '', y: '', label: '', value: ''
                    },
                    labels: {x: '', y: ''}
                })
            ).set('content', Immutable.List(['0']));
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '0', 'graphType'], 'barChart'
            ).setIn(['blocks', '0', 'content'], "return graphs.barChart(data, '', '');");
            const action = {
                type: actions.UPDATE_GRAPH_BLOCK_PROPERTY,
                id: '0',
                property: 'graphType',
                value: 'barChart'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should include hints in generated code, if present', () => {
            const beforeState = initialState.setIn(
                ['blocks', '0'], Immutable.fromJS({
                    id: '0',
                    type: 'graph',
                    language: 'javascript',
                    option: 'runnable',
                    graphType: 'pieChart',
                    dataPath: 'data',
                    content: 'return graphs.pieChart(data);',
                    hints: {
                        x: 'stargazers', y: '', label: '', value: ''
                    },
                    labels: {x: '', y: ''}
                })
            ).set('content', Immutable.List(['0']));
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '0', 'hints', 'label'], 'name'
            ).setIn(
                ['blocks', '0', 'content'],
                "return graphs.pieChart(data, {label: 'name'});"
            );
            const action = {
                type: actions.UPDATE_GRAPH_BLOCK_HINT,
                id: '0',
                hint: 'label',
                value: 'name'
            };
            expect(reducer(beforeState, action).toJS()).to.eql(afterState.toJS());
        });

        it('should include labels in generated code', () => {
            const beforeState = initialState.setIn(
                ['blocks', '0'], Immutable.fromJS({
                    id: '0',
                    type: 'graph',
                    language: 'javascript',
                    option: 'runnable',
                    graphType: 'barChart',
                    dataPath: 'data',
                    content: 'return graphs.barChart(data);',
                    hints: {
                        x: '', y: '', label: '', value: ''
                    },
                    labels: {x: '', y: ''}
                })
            ).set('content', Immutable.List(['0']));
            const afterState = handleFirstChange(beforeState).setIn(
                ['blocks', '0', 'labels', 'x'], 'name'
            ).setIn(
                ['blocks', '0', 'content'],
                "return graphs.barChart(data, 'name', '');"
            );
            const action = {
                type: actions.UPDATE_GRAPH_BLOCK_LABEL,
                id: '0',
                label: 'x',
                value: 'name'
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
