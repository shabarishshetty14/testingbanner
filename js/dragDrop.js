/* -----------------------------
   Drag & Drop and Marquee Selection
------------------------------ */

let dragState = null; 
let marqueeState = null;

previewArea.addEventListener('mousedown', (e) => {
    if (e.target.closest('.preview, .preview-text')) {
        handleElementDragStart(e);
    } else {
        if (selectionList.length > 0) {
            selectionList = [];
            renderLayers();
            highlightPreview();
            updateAlignmentToolbarVisibility();
        }
        handleMarqueeStart(e);
    }
});

function handleElementDragStart(e) {
    const target = e.target.closest('.preview, .preview-text');
    const targetData = getImageDataById(target.id) || getTextDataById(target.id);
    if (!targetData || targetData.isLocked) return;
    const isTargetSelected = selectionList.some(item => item.id === targetData.id);
    if (!isTargetSelected) {
        selectionList = [targetData];
        activeDragTarget = targetData.type === 'image'
            ? { imgData: targetData, animIndex: null }
            : { textData: targetData, animIndex: null };
        renderLayers();
        highlightPreview();
    }
    if (selectionList.some(item => item.isLocked)) { return; }
    const rectParent = previewArea.getBoundingClientRect();
    dragState = {
        items: selectionList.map(item => {
            const el = item.previewImg || item.previewElement;
            if (!el) return null;
            const rectElem = el.getBoundingClientRect();
            return {
                data: item,
                el: el,
                startLeft: rectElem.left - rectParent.left,
                startTop: rectElem.top - rectParent.top
            };
        }).filter(Boolean),
        startMouseX: e.clientX,
        startMouseY: e.clientY
    };
    document.addEventListener('mousemove', onElementDragMove);
    document.addEventListener('mouseup', onElementDragEnd);
    e.preventDefault();
}

function onElementDragMove(e) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startMouseX;
    const dy = e.clientY - dragState.startMouseY;
    dragState.items.forEach(item => {
        let newLeft = item.startLeft + dx;
        let newTop = item.startTop + dy;
        if (document.getElementById('snapToGridToggle').checked) {
            newLeft = snapToGrid(newLeft);
            newTop = snapToGrid(newTop);
        }
        item.el.style.left = newLeft + 'px';
        item.el.style.top = newTop + 'px';
    });
}

function onElementDragEnd() {
    if (!dragState) return;
    const firstItem = dragState.items[0];
    if (!firstItem) return;
    const dx = parseInt(firstItem.el.style.left) - firstItem.startLeft;
    const dy = parseInt(firstItem.el.style.top) - firstItem.startTop;
    
    if (dx !== 0 || dy !== 0) {
        const movedElements = dragState.items.map(item => item.data);
        history.do(new MoveCommand(movedElements, dx, dy));
    } else {
        updatePreviewAndCode();
    }
    document.removeEventListener('mousemove', onElementDragMove);
    document.removeEventListener('mouseup', onElementDragEnd);
    dragState = null;
}

// --- MARQUEE SELECTION LOGIC ---
function handleMarqueeStart(e) {
    const rectParent = previewArea.getBoundingClientRect();
    marqueeState = { startX: e.clientX - rectParent.left, startY: e.clientY - rectParent.top, box: document.createElement('div') };
    marqueeState.box.className = 'marquee-box';
    previewArea.appendChild(marqueeState.box);
    document.addEventListener('mousemove', onMarqueeMove);
    document.addEventListener('mouseup', onMarqueeEnd);
}

function onMarqueeMove(e) {
    if (!marqueeState) return;
    const rectParent = previewArea.getBoundingClientRect();
    const currentX = e.clientX - rectParent.left;
    const currentY = e.clientY - rectParent.top;
    const x = Math.min(marqueeState.startX, currentX);
    const y = Math.min(marqueeState.startY, currentY);
    const width = Math.abs(currentX - marqueeState.startX);
    const height = Math.abs(currentY - marqueeState.startY);
    marqueeState.box.style.left = x + 'px';
    marqueeState.box.style.top = y + 'px';
    marqueeState.box.style.width = width + 'px';
    marqueeState.box.style.height = height + 'px';
}

function onMarqueeEnd(e) {
    if (!marqueeState) return;
    const marqueeRect = marqueeState.box.getBoundingClientRect();
    const newSelection = [];
    layerOrder.forEach(item => {
        if (item.isLocked || !item.isVisible) return;
        const el = item.previewImg || item.previewElement;
        if (!el) return;
        const elRect = el.getBoundingClientRect();
        const intersects = !(marqueeRect.right < elRect.left || marqueeRect.left > elRect.right || marqueeRect.bottom < elRect.top || marqueeRect.top > elRect.bottom);
        if (intersects) {
            newSelection.push(item);
        }
    });
    selectionList = newSelection;
    renderLayers();
    highlightPreview();
    updateAlignmentToolbarVisibility();
    previewArea.removeChild(marqueeState.box);
    document.removeEventListener('mousemove', onMarqueeMove);
    document.removeEventListener('mouseup', onMarqueeEnd);
    marqueeState = null;
}