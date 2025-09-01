const contextMenu = document.getElementById('context-menu');
let rightClickedElement = null;

function initContextMenu() {
    previewArea.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const target = e.target.closest('.preview, .preview-text');
        if (!target) { hideContextMenu(); return; }
        rightClickedElement = layerOrder.find(item => item.id === target.id);
        if (!rightClickedElement) return;
        positionContextMenu(e.clientX, e.clientY);
    });

    document.addEventListener('click', (e) => { if (!contextMenu.contains(e.target)) hideContextMenu(); });

    contextMenu.addEventListener('click', (e) => {
        const actionItem = e.target.closest('li');
        if (!actionItem || !rightClickedElement) return;
        const action = actionItem.dataset.action;
        performAction(action, rightClickedElement);
        hideContextMenu();
    });
}

function positionContextMenu(x, y) {
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
    rightClickedElement = null;
}

function performAction(action, element) {
    if (!element) return;
    
    if (!selectionList.some(item => item.id === element.id)) {
        selectionList = [element];
        renderLayers();
        highlightPreview();
    }

    const oldIndex = layerOrder.findIndex(item => item.id === element.id);

    switch(action) {
        case 'duplicate':
            duplicateElement(element);
            break;
        case 'delete':
            history.do(new DeleteCommand(selectionList));
            break;
        case 'bring-to-front':
            if (oldIndex < layerOrder.length - 1) {
                history.do(new ReorderCommand(element, layerOrder.length - 1, oldIndex));
            }
            break;
        case 'send-to-back':
            if (oldIndex > 0) {
                history.do(new ReorderCommand(element, 0, oldIndex));
            }
            break;
    }
}