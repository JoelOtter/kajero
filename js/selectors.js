export const metadataSelector = state => {
    return {metadata: state.notebook.get('metadata')};
};

export const contentSelector = state => {
    return {
        content: state.notebook.get('content').map(
            num => state.notebook.getIn(['blocks', String(num)])
        ),
        results: state.execution.get('results'),
        blocksExecuted: state.execution.get('blocksExecuted')
    };
};

export const editorSelector = state => {
    return {editable: state.editor.get('editable')};
};
