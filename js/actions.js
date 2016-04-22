import { extractMarkdownFromHTML } from './util';
import { gistUrl } from './config';
import { parse } from 'query-string';

/*
 * Action types
 */
export const LOAD_MARKDOWN = 'LOAD_MARKDOWN';
export const EXECUTE = 'EXECUTE';
export const RECEIVED_DATA = 'RECEIVED_DATA';
export const TOGGLE_EDIT = 'TOGGLE_EDIT';
export const UPDATE_BLOCK = 'UPDATE_BLOCK';
export const UPDATE_META = 'UPDATE_META';
export const TOGGLE_META = 'TOGGLE_META';
export const ADD_BLOCK = 'ADD_BLOCK';
export const DELETE_BLOCK = 'DELETE_BLOCK';
export const MOVE_BLOCK_DOWN = 'MOVE_BLOCK_DOWN';
export const MOVE_BLOCK_UP = 'MOVE_BLOCK_UP';
export const DELETE_DATASOURCE = 'DELETE_DATASOURCE';
export const UPDATE_DATASOURCE = 'UPDATE_DATASOURCE';

function checkStatus (response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        throw new Error(response.statusText);
    }
}

export function loadMarkdown() {
    const queryParams = parse(location.search);
    if (queryParams.id) {
        const url = gistUrl + queryParams.id + '/raw';
        return (dispatch, getState) => {
            return fetch(url, {
                method: 'get'
            })
            .then(checkStatus)
            .then(response => response.text())
            .then(md => dispatch({
                type: LOAD_MARKDOWN,
                markdown: md
            }))
            .catch(() => dispatch(loadMarkdownFromHTML()));
        };
    }
    return loadMarkdownFromHTML();
}

function loadMarkdownFromHTML() {
    return {
        type: LOAD_MARKDOWN,
        markdown: extractMarkdownFromHTML()
    };
}

export function executeCodeBlock (codeBlock) {
    return {
        type: EXECUTE,
        id: codeBlock.get('id'),
        code: codeBlock.get('content')
    };
}

function receivedData (name, data) {
    return {
        type: RECEIVED_DATA,
        name,
        data
    };
}

export function fetchData() {
    return (dispatch, getState) => {
        let proms = [];
        getState().notebook.getIn(['metadata', 'datasources']).forEach(
            (url, name) => {
                proms.push(
                    fetch(url, {
                        method: 'get'
                    })
                    .then(response => response.json())
                    .then(j => dispatch(receivedData(name, j)))
                );
            }
        );
        return Promise.all(proms);
    };
}

export function toggleEdit() {
    return {
        type: TOGGLE_EDIT
    };
}

export function updateBlock (id, text) {
    return {
        type: UPDATE_BLOCK,
        id,
        text
    };
};

export function updateTitle (text) {
    return {
        type: UPDATE_META,
        field: 'title',
        text
    };
};

export function updateAuthor (text) {
    return {
        type: UPDATE_META,
        field: 'author',
        text
    };
};

export function toggleFooter() {
    return {
        type: TOGGLE_META,
        field: 'showFooter'
    };
};

export function addCodeBlock(id) {
    return {
        type: ADD_BLOCK,
        blockType: 'code',
        id
    };
};

export function addTextBlock(id) {
    return {
        type: ADD_BLOCK,
        blockType: 'text',
        id
    };
};

export function deleteBlock(id) {
    return {
        type: DELETE_BLOCK,
        id
    };
};

export function moveBlockUp(id) {
    return {
        type: MOVE_BLOCK_UP,
        id
    };
};

export function moveBlockDown(id) {
    return {
        type: MOVE_BLOCK_DOWN,
        id
    };
};

export function deleteDatasource(id) {
    return {
        type: DELETE_DATASOURCE,
        id
    };
};

export function updateDatasource(id, url) {
    return {
        type: UPDATE_DATASOURCE,
        id,
        text: url
    };
};
