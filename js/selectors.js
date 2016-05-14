export const metadataSelector = state => {
    return {
        metadata: state.notebook.get('metadata'),
        undoSize: state.notebook.get('undoStack').size
    };
};

export const contentSelector = state => {
    return {
        content: state.notebook.get('content').map(
            num => state.notebook.getIn(['blocks', num])
        ),
        results: state.execution.get('results'),
        blocksExecuted: state.execution.get('blocksExecuted')
    };
};

export const editorSelector = state => {
    return state.editor.toJS();
};

export const saveSelector = state => {
    return {notebook: state.notebook};
};

export const dataSelector = state => {
    return {data: state.execution.get('data').toJS()};
};
