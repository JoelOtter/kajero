import { expect } from 'chai';
import Immutable from 'immutable';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetchMock from 'fetch-mock';
import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('async actions', () => {
    afterEach(fetchMock.restore);

    it('creates RECEIVED_DATA when data is received', () => {
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
                }
            })
        });

        const expecteds = [
            {type: actions.RECEIVED_DATA, name: 'one', data: {thing: 'data1'}},
            {type: actions.RECEIVED_DATA, name: 'two', data: {thing: 'data2'}}
        ];

        return store.dispatch(actions.fetchData())
            .then(() => {
                expect(store.getActions()).to.eql(expecteds);
            });
    });
});

describe('actions', () => {

    it('should create an action to load Markdown', () => {
        const md = '## Test';
        const expected = {
            type: actions.LOAD_MARKDOWN,
            markdown: md
        };
        expect(actions.loadMarkdown(md)).to.eql(expected);
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

});
