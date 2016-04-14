/*
 * Action types
 */
export const LOAD_MARKDOWN = 'LOAD_MARKDOWN';
export const EXECUTE = 'EXECUTE';
export const RECEIVED_DATA = 'RECEIVED_DATA';
export const TOGGLE_EDIT = 'TOGGLE_EDIT';

export function loadMarkdown(markdown) {
    return {
        type: LOAD_MARKDOWN,
        markdown: markdown
    };
}

export function executeCodeBlock(codeBlock) {
    return {
        type: EXECUTE,
        id: codeBlock.get('id'),
        code: codeBlock.get('content')
    };
}

function receivedData(name, data) {
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
