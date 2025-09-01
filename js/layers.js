const layersContainer = document.getElementById('layers-container');

function renderLayers() {
    layersContainer.innerHTML = '';

    if (layerOrder.length === 0) {
        layersContainer.classList.add('empty');
        layersContainer.innerHTML = '<p>Add an image or text to begin.</p>';
        return;
    }

    layersContainer.classList.remove('empty');
    const selectionIds = new Set(selectionList.map(item => item.id));

    [...layerOrder].reverse().forEach(item => {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.id = item.id;
        layerItem.draggable = true;

        const displayName = item.customName || (item.type === 'image' ? item.fileName : item.content) || `Layer ${layerOrder.indexOf(item) + 1}`;
        const isVisibleClass = item.isVisible ? '' : 'inactive';
        const isLockedClass = item.isLocked ? '' : 'inactive';
        
        const thumb = item.type === 'image' 
          ? `<img class="layer-thumb" src="${item.thumbnailSrc || ''}" alt="thumbnail">`
          : `<div class="layer-thumb-placeholder"><i class="fas fa-font"></i></div>`;

        layerItem.innerHTML = `
            ${thumb}
            <span class="layer-name">${displayName}</span>
            <div class="layer-controls">
                <button class="layer-btn visibility-btn ${isVisibleClass}" title="Toggle Visibility"><i class="fa-solid fa-eye"></i></button>
                <button class="layer-btn lock-btn ${isLockedClass}" title="Toggle Lock"><i class="fa-solid fa-lock"></i></button>
                <button class="layer-btn duplicate-btn" title="Duplicate Layer"><i class="fa-solid fa-copy"></i></button>
            </div>
        `;
        
        if (selectionIds.has(item.id)) {
            layerItem.classList.add('selected');
        }

        const layerNameSpan = layerItem.querySelector('.layer-name');
        layerNameSpan.addEventListener('dblclick', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'layer-name-input';
            input.value = displayName;
            
            layerNameSpan.replaceWith(input);
            input.focus();
            input.select();

            const saveName = () => {
                const oldName = item.customName;
                const newName = input.value.trim();
                if (newName && newName !== oldName) {
                    history.do(new PropertyChangeCommand([item], 'customName', newName, oldName));
                } else {
                    renderLayers(); // Revert if empty or unchanged
                }
            };
            
            input.addEventListener('blur', saveName);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') input.blur();
                if (e.key === 'Escape') {
                    input.value = displayName; // Revert changes
                    input.blur();
                }
            });
        });

        layerItem.addEventListener('click', (e) => {
            if (e.target.closest('.layer-btn') || e.target.closest('.layer-name-input')) return;
            
            const isCtrlOrCmd = e.metaKey || e.ctrlKey;
            const isShift = e.shiftKey;

            // --- FIX: This check prevents a re-render on a simple click of an already selected item, allowing dblclick to work. ---
            if (selectionList.length === 1 && selectionList[0].id === item.id && !isCtrlOrCmd && !isShift) {
                return;
            }
            // --- END FIX ---

            const lastSelectedItem = activeDragTarget.imgData || activeDragTarget.textData;

            if (isShift && lastSelectedItem) {
                const visuallyOrderedItems = [...layerOrder].reverse();
                const lastIndex = visuallyOrderedItems.findIndex(i => i.id === lastSelectedItem.id);
                const currentIndex = visuallyOrderedItems.findIndex(i => i.id === item.id);
                const start = Math.min(lastIndex, currentIndex);
                const end = Math.max(lastIndex, currentIndex);
                selectionList = visuallyOrderedItems.slice(start, end + 1);
            } else if (isCtrlOrCmd) {
                const indexInSelection = selectionList.findIndex(i => i.id === item.id);
                if (indexInSelection > -1) {
                    selectionList.splice(indexInSelection, 1);
                } else {
                    selectionList.push(item);
                }
            } else {
                selectionList = [item];
            }
            
            activeDragTarget = item.type === 'image' 
                ? { imgData: item, textData: null, animIndex: null }
                : { imgData: null, textData: item, animIndex: null };
            
            renderLayers();
            highlightPreview();
            updateAlignmentToolbarVisibility();
        });
        
        const visibilityBtn = layerItem.querySelector('.visibility-btn');
        visibilityBtn.addEventListener('click', (e) => { e.stopPropagation(); history.do(new PropertyChangeCommand([item], 'isVisible', !item.isVisible, item.isVisible)); });

        const lockBtn = layerItem.querySelector('.lock-btn');
        lockBtn.addEventListener('click', (e) => { e.stopPropagation(); history.do(new PropertyChangeCommand([item], 'isLocked', !item.isLocked, item.isLocked)); });

        const duplicateBtn = layerItem.querySelector('.duplicate-btn');
        duplicateBtn.addEventListener('click', (e) => { e.stopPropagation(); duplicateElement(item); });
        
        layerItem.addEventListener('dragstart', (e) => {
            if (item.isLocked) { e.preventDefault(); return; }
            layerItem.classList.add('dragging');
        });

        layerItem.addEventListener('dragend', () => {
            layerItem.classList.remove('dragging');
        });

        layersContainer.appendChild(layerItem);
    });
}

layersContainer.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(layersContainer, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    if (afterElement == null) {
        layersContainer.appendChild(dragging);
    } else {
        layersContainer.insertBefore(dragging, afterElement);
    }
});

layersContainer.addEventListener('drop', e => {
    e.preventDefault();
    const draggedElement = document.querySelector('.dragging');
    if (!draggedElement) return;

    const oldOrder = [...layerOrder];
    const newOrderedIds = Array.from(layersContainer.querySelectorAll('.layer-item')).map(item => item.dataset.id).reverse();
    const allElementsMap = new Map();
    [...imageList, ...textList].forEach(item => allElementsMap.set(item.id, item));
    layerOrder = newOrderedIds.map(id => allElementsMap.get(id));
    
    // Create a command for reordering
    history.do({
        execute: function() {
            layerOrder = newOrderedIds.map(id => allElementsMap.get(id));
            renderLayers();
            updatePreviewAndCode();
        },
        undo: function() {
            layerOrder = oldOrder;
            renderLayers();
            updatePreviewAndCode();
        }
    });
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.layer-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function duplicateElement(elementToDuplicate) {
    const a = JSON.parse(JSON.stringify(elementToDuplicate));
    a.id = elementToDuplicate.type + Date.now();
    a.x += 10;
    a.y += 10;

    if (a.type === 'image') {
        createControlBlock(imageList.length);
        const newImage = imageList[imageList.length - 1];
        Object.assign(newImage, { ...a, wrapper: newImage.wrapper, previewImg: null });
        updateImageControlUI(newImage);
    } else {
        createTextControlBlock(textList.length);
        const newText = textList[textList.length - 1];
        Object.assign(newText, { ...a, wrapper: newText.wrapper, previewElement: null });
        updateTextControlUI(newText);
    }

    const originalIndex = layerOrder.findIndex(item => item.id === elementToDuplicate.id);
    const newElement = layerOrder.pop();
    if (originalIndex !== -1) {
        layerOrder.splice(originalIndex + 1, 0, newElement);
    } else {
        layerOrder.push(newElement);
    }

    renderLayers();
    updatePreviewAndCode();
}

