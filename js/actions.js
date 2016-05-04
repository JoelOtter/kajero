import { extractMarkdownFromHTML } from './util';
import { gistUrl, gistApi } from './config';
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
export const TOGGLE_SAVE = 'TOGGLE_SAVE';
export const GIST_CREATED = 'GIST_CREATED';
export const UNDO = 'UNDO';
export const EXECUTE_AUTO = 'EXECUTE_AUTO';
export const CHANGE_CODE_BLOCK_OPTION = 'CHANGE_CODE_BLOCK_OPTION';

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
            .then(() => dispatch(fetchData()))
            .catch(() => {
                dispatch(loadMarkdownFromHTML());
                dispatch(fetchData());
            })
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
        const currentData = getState().execution.get('data');
        getState().notebook.getIn(['metadata', 'datasources']).forEach(
            (url, name) => {
                if (!currentData.has(name)) {
                    proms.push(
                        fetch(url, {
                            method: 'get'
                        })
                        .then(response => response.json())
                        .then(j => dispatch(receivedData(name, j)))
                    );
                }
            }
        );
        // When all data fetched, run all the auto-running code blocks.
        return Promise.all(proms).then(() => dispatch(
            executeAuto(
                getState().notebook.get('blocks'),
                getState().notebook.get('content')
            )
        ));
    };
}

function executeAuto(blocks, content) {
    return {
        type: EXECUTE_AUTO,
        blocks,
        content
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

export function toggleSave() {
    return {
        type: TOGGLE_SAVE
    };
};

function gistCreated(id) {
    return {
        type: GIST_CREATED,
        id
    };
}

export function saveGist (title, markdown) {
    return (dispatch, getState) => {
        fetch(gistApi, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                description: title,
                'public': true,
                files: {
                    'notebook.md': {
                        content: markdown
                    }
                }
            })
        })
        .then(response => response.json())
        .then(gist => dispatch(gistCreated(gist.id)));
    };
};

export function undo() {
    return {
        type: UNDO
    };
}

export function changeCodeBlockOption(id) {
    return {
        type: CHANGE_CODE_BLOCK_OPTION,
        id
    };
}
