import { expect } from 'chai';
import Immutable from 'immutable';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';
import { gistUrl, gistApi } from './config';
import * as actions from './actions';
import * as util from './util';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('actions', () => {

    const testMd = '## Test';

    describe('async actions', () => {

        before(() => {
            global.location = {search: '?id=123'};
            sinon.stub(util, 'extractMarkdownFromHTML').returns(testMd);
        });

        after(() => {
            global.location = {};
            util.extractMarkdownFromHTML.restore();
        });

        afterEach(fetchMock.restore);

        it('should create RECEIVED_DATA, EXECUTE_AUTO when data is received', () => {
            fetchMock
                .mock('http://example.com/data1', {body: {thing: 'data1'}})
                .mock('http://example.com/data2', {body: {thing: 'data2'}});

            const store = mockStore({
                notebook: Immutable.fromJS({
                    metadata: {
                        datasources: {
                            one: 'http://example.com/data1',
                            two: 'http://example.com/data2'
                        }
                    },
                    blocks: 'stubBlocks',
                    content: 'stubContent'
                }),
                execution: Immutable.fromJS({
                    data: {}
                })
            });

            const expecteds = [
                {type: actions.RECEIVED_DATA, name: 'one', data: {thing: 'data1'}},
                {type: actions.RECEIVED_DATA, name: 'two', data: {thing: 'data2'}},
                {type: actions.EXECUTE_AUTO, blocks: 'stubBlocks', content: 'stubContent'}
            ];

            return store.dispatch(actions.fetchData())
                .then(() => {
                    expect(store.getActions()).to.eql(expecteds);
                });
        });

        it('should not fetch data unless necessary', () => {
            fetchMock
                .mock('http://example.com/data1', {body: {thing: 'data1'}})
                .mock('http://example.com/data2', {body: {thing: 'data2'}});

            const store = mockStore({
                notebook: Immutable.fromJS({
                    metadata: {
                        datasources: {
                            one: 'http://example.com/data1',
                            two: 'http://example.com/data2'
                        }
                    },
                    blocks: 'stubBlocks',
                    content: 'stubContent'
                }),
                execution: Immutable.fromJS({
                    data: {one: 'hooray'}
                })
            });

            const expected = [
                {type: actions.RECEIVED_DATA, name: 'two', data: {thing: 'data2'}},
                {type: actions.EXECUTE_AUTO, blocks: 'stubBlocks', content: 'stubContent'}
            ];

            return store.dispatch(actions.fetchData())
                .then(() => {
                    expect(store.getActions()).to.eql(expected);
                });
        });

        it('should create LOAD_MARKDOWN with received markdown', () => {
            const md = '## Some markdown';
            fetchMock
                .mock(gistUrl + '123/raw', {body: md});

            const store = mockStore({
                notebook: Immutable.fromJS({
                    metadata: {
                        datasources: {}
                    },
                    blocks: 'stubBlocks',
                    content: 'stubContent'
                }),
                execution: Immutable.fromJS({
                    data: {}
                })
            });
            const expected = [
                {type: actions.LOAD_MARKDOWN, markdown: md},
                {type: actions.EXECUTE_AUTO, content: 'stubContent', blocks: 'stubBlocks'}
            ];

            return store.dispatch(actions.loadMarkdown())
                .then(() => {
                    expect(store.getActions()).to.eql(expected);
                });
        });

        it('should use markdown from HTML on fetch error', () => {
            fetchMock
                .mock(gistUrl + '123/raw', 404);

            const store = mockStore({
                notebook: Immutable.fromJS({
                    metadata: {
                        datasources: {}
                    },
                    blocks: 'stubBlocks',
                    content: 'stubContent'
                }),
                execution: Immutable.fromJS({
                    data: {}
                })
            });
            const expected = [
                {type: actions.LOAD_MARKDOWN, markdown: testMd},
                {type: actions.EXECUTE_AUTO, content: 'stubContent', blocks: 'stubBlocks'}
            ];

            return store.dispatch(actions.loadMarkdown())
                .then(() => {
                    expect(store.getActions()).to.eql(expected);
                });

        });

        it('should save a gist and return a GIST_CREATED action', () => {
            fetchMock.mock(gistApi, 'POST', {
                id: 'test_gist_id'
            });

            const store = mockStore({});
            const expected = [{type: actions.GIST_CREATED, id: 'test_gist_id'}]

            return store.dispatch(actions.saveGist('title', '## markdown'));
        })

    });

    describe('normal actions', () => {

        before(() => {
            global.location = {search: ''};
            sinon.stub(util, 'extractMarkdownFromHTML').returns(testMd);
        });

        after(() => {
            global.location = {};
            util.extractMarkdownFromHTML.restore();
        });

        it('should create an action with local Markdown if no id param', () => {
            const expected = {
                type: actions.LOAD_MARKDOWN,
                markdown: testMd
            };
            expect(actions.loadMarkdown()).to.eql(expected);
        });

        it('should create an action to execute code', () => {
            const id = '12';
            const content = 'console.log("Hello");';
            const codeBlock = Immutable.Map({
                id, content
            });
            const expected = {
                type: actions.EXECUTE,
                code: content,
                id: id
            };
            expect(actions.executeCodeBlock(codeBlock)).to.eql(expected);
        });

        it('should create an action for toggling the editor', () => {
            const expected = {
                type: actions.TOGGLE_EDIT
            };
            expect(actions.toggleEdit()).to.eql(expected);
        });

        it('should create an action for updating a block', () => {
            const id = '12';
            const text = '## some markdown';
            const expected = {
                type: actions.UPDATE_BLOCK,
                id,
                text
            };
            expect(actions.updateBlock(id, text)).to.eql(expected);
        });

        it('should create an action for adding a new text block', () => {
            const id = '12';
            const expected = {
                type: actions.ADD_BLOCK,
                blockType: 'text',
                id
            };
            expect(actions.addTextBlock(id)).to.eql(expected);
        });

        it('should create an action for adding a new code block', () => {
            const id = '12';
            const expected = {
                type: actions.ADD_BLOCK,
                blockType: 'code',
                id
            };
            expect(actions.addCodeBlock(id)).to.eql(expected);
        });

        it('should create an action for deleting a block', () => {
            const id = '12';
            const expected = {
                type: actions.DELETE_BLOCK,
                id
            };
            expect(actions.deleteBlock(id)).to.eql(expected);
        });

        it('should create an action for updating the title', () => {
            const text = 'New title';
            const expected = {
                type: actions.UPDATE_META,
                field: 'title',
                text
            };
            expect(actions.updateTitle(text)).to.eql(expected);
        });

        it('should create an action for updating the author', () => {
            const text = 'New author';
            const expected = {
                type: actions.UPDATE_META,
                field: 'author',
                text
            };
            expect(actions.updateAuthor(text)).to.eql(expected);
        });

        it('should create an action for toggling the footer', () => {
            const expected = {
                type: actions.TOGGLE_META,
                field: 'showFooter'
            };
            expect(actions.toggleFooter()).to.eql(expected);
        });

        it('should create an action for moving a block up', () => {
            const id = '12';
            const expected = {
                type: actions.MOVE_BLOCK_UP,
                id
            };
            expect(actions.moveBlockUp(id)).to.eql(expected);
        });

        it('should create an action for moving a block down', () => {
            const id = '12';
            const expected = {
                type: actions.MOVE_BLOCK_DOWN,
                id
            };
            expect(actions.moveBlockDown(id)).to.eql(expected);
        });

        it('should create an action for updating a datasource', () => {
            const name = 'github';
            const url = 'http://github.com';
            const expected = {
                type: actions.UPDATE_DATASOURCE,
                id: name,
                text: url
            };
            expect(actions.updateDatasource(name, url)).to.eql(expected);
        });

        it('should create an action for deleting a datasource', () => {
            const name = 'github';
            const expected = {
                type: actions.DELETE_DATASOURCE,
                id: name
            };
            expect(actions.deleteDatasource(name)).to.eql(expected);
        });

        it('should create an action to toggle the save form', () => {
            const expected = {
                type: actions.TOGGLE_SAVE
            };
            expect(actions.toggleSave()).to.eql(expected);
        });

        it('should create an action for undo', () => {
            const expected = {
                type: actions.UNDO
            };
            expect(actions.undo()).to.eql(expected);
        });

        it('should create an action for changing code block option', () => {
             const expected = {
                 type: actions.CHANGE_CODE_BLOCK_OPTION,
                 id: 'testId'
            };
            expect(actions.changeCodeBlockOption('testId')).to.eql(expected);
        });

        it('should create an action for creating a graph block', () => {
            const expd = {
                type: actions.ADD_BLOCK,
                blockType: 'graph',
                id: '12'
            };
            expect(actions.addGraphBlock('12')).to.eql(expd);
        });

        it('should create an action for changing graph type', () => {
            const expd = {
                type: actions.UPDATE_GRAPH_BLOCK_PROPERTY,
                property: 'graphType',
                value: 'pieChart',
                id: '12'
            };
            expect(actions.updateGraphType('12', 'pieChart')).to.eql(expd);
        });

        it('should create an action for updating graph block data path', () => {
            const expd = {
                type: actions.UPDATE_GRAPH_BLOCK_PROPERTY,
                property: 'dataPath',
                value: 'data.popular',
                id: '12'
            };
            expect(actions.updateGraphDataPath('12', 'data.popular')).to.eql(expd);
        });

        it('should create an action for updating graph block hint', () => {
            const expd = {
                type: actions.UPDATE_GRAPH_BLOCK_HINT,
                hint: 'label',
                value: 'name',
                id: '12'
            };
            expect(actions.updateGraphHint('12', 'label', 'name')).to.eql(expd);
        });

        it('should create an action for updating graph block label', () => {
            const expd = {
                type: actions.UPDATE_GRAPH_BLOCK_LABEL,
                label: 'x',
                value: 'Repos',
                id: '12'
            };
            expect(actions.updateGraphLabel('12', 'x', 'Repos')).to.eql(expd);
        });

        it('should create an action for saving graph block to code', () => {
            const expd = {
                type: actions.UPDATE_GRAPH_BLOCK_PROPERTY,
                property: 'type',
                value: 'code',
                id: '12'
            };
            expect(actions.compileGraphBlock('12')).to.eql(expd);
        });

        it('should create an action for clearing graph data', () => {
            const expd = {
                type: actions.CLEAR_GRAPH_BLOCK_DATA,
                id: '12'
            };
            expect(actions.clearGraphData('12')).to.eql(expd);
        });

    });

});
