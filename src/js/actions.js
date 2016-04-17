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

export function loadMarkdown (markdown) {
    return {
        type: LOAD_MARKDOWN,
        markdown: markdown
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
        getState().notebook.getIn(['metadata', 'datasources']).forEach(
            (url, name) => {
                fetch(url, {
                    method: 'get'
                })
                .then(response => response.json())
                .then(j => dispatch(receivedData(name, j)));
            }
        );
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
