const alignmentToolbar = document.getElementById('alignment-toolbar');
const alignToCanvasToggle = document.getElementById('align-to-canvas-toggle');

function updateAlignmentToolbarVisibility() {
    const selectedCount = selectionList.length;
    
    alignmentToolbar.style.display = selectedCount >= 1 ? 'flex' : 'none';

    alignmentToolbar.querySelectorAll('[data-align]').forEach(btn => btn.disabled = selectedCount < 1);
    alignmentToolbar.querySelectorAll('[data-distribute]').forEach(btn => btn.disabled = selectedCount < 3);
}

function getSelectionBoundingBox() {
    if (selectionList.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectionList.forEach(item => {
        minX = Math.min(minX, item.x);
        minY = Math.min(minY, item.y);
        maxX = Math.max(maxX, item.x + item.width);
        maxY = Math.max(maxY, item.y + item.height);
    });
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

alignmentToolbar.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button || button.disabled) return;

    const align = button.dataset.align;
    const distribute = button.dataset.distribute;
    
    const originalPositions = new Map();
    selectionList.forEach(item => {
        originalPositions.set(item.id, { x: item.x, y: item.y });
    });

    const tempSelection = JSON.parse(JSON.stringify(selectionList));

    const isAlignToCanvas = alignToCanvasToggle.checked;
    const bbox = isAlignToCanvas 
        ? { x: 0, y: 0, width: parseInt(widthInput.value), height: parseInt(heightInput.value) }
        : getSelectionBoundingBox();

    if (!bbox) return;

    if (align) {
        const groupBbox = getSelectionBoundingBox();
        tempSelection.forEach(item => {
            const offsetX = item.x - groupBbox.x;
            const offsetY = item.y - groupBbox.y;

            switch (align) {
                case 'left':    item.x = isAlignToCanvas ? bbox.x + offsetX : bbox.x; break;
                case 'h-center':item.x = isAlignToCanvas ? bbox.x + bbox.width / 2 - groupBbox.width / 2 + offsetX : bbox.x + bbox.width / 2 - item.width / 2; break;
                case 'right':   item.x = isAlignToCanvas ? bbox.x + bbox.width - groupBbox.width + offsetX : bbox.x + bbox.width - item.width; break;
                case 'top':     item.y = isAlignToCanvas ? bbox.y + offsetY : bbox.y; break;
                case 'v-center':item.y = isAlignToCanvas ? bbox.y + bbox.height / 2 - groupBbox.height / 2 + offsetY : bbox.y + bbox.height / 2 - item.height / 2; break;
                case 'bottom':  item.y = isAlignToCanvas ? bbox.y + bbox.height - groupBbox.height + offsetY : bbox.y + bbox.height - item.height; break;
            }
        });
    }
    
    if (distribute) {
        tempSelection.sort((a, b) => distribute === 'horizontal' ? a.x - b.x : a.y - b.y);
        if (tempSelection.length < 2) return;
        
        const firstItem = tempSelection[0];
        const lastItem = tempSelection[tempSelection.length - 1];
        
        let totalElementsSize = 0;
        tempSelection.forEach(item => {
            totalElementsSize += distribute === 'horizontal' ? item.width : item.height;
        });
        
        if (distribute === 'horizontal') {
            const totalRange = (lastItem.x + lastItem.width) - firstItem.x;
            const totalSpacing = totalRange - totalElementsSize;
            const spacing = totalSpacing / (tempSelection.length - 1);

            let currentX = firstItem.x;
            tempSelection.forEach(item => {
                item.x = Math.round(currentX);
                currentX += item.width + spacing;
            });
        } else { // Vertical
            const totalRange = (lastItem.y + lastItem.height) - firstItem.y;
            const totalSpacing = totalRange - totalElementsSize;
            const spacing = totalSpacing / (tempSelection.length - 1);

            let currentY = firstItem.y;
            tempSelection.forEach(item => {
                item.y = Math.round(currentY);
                currentY += item.height + spacing;
            });
        }
    }
    
    const command = {
        items: tempSelection.map(tempItem => ({
            element: selectionList.find(orig => orig.id === tempItem.id),
            newPos: { x: Math.round(tempItem.x), y: Math.round(tempItem.y) },
            oldPos: originalPositions.get(tempItem.id)
        })),
        execute: function() { this.items.forEach(item => { item.element.x = item.newPos.x; item.element.y = item.newPos.y; }); this.updateUI(); },
        undo: function() { this.items.forEach(item => { item.element.x = item.oldPos.x; item.element.y = item.oldPos.y; }); this.updateUI(); },
        updateUI: function() {
            this.items.forEach(item => {
                const wrapper = item.element.wrapper;
                if (wrapper) {
                    wrapper.querySelector('.posX').value = item.element.x;
                    wrapper.querySelector('.posY').value = item.element.y;
                }
            });
            updatePreviewAndCode();
        }
    };
    
    if (command.items.some(item => item.newPos.x !== item.oldPos.x || item.newPos.y !== item.oldPos.y)) {
        history.do(command);
    }
});