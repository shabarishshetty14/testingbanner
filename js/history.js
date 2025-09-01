// --- COMMAND CLASSES ---

class MoveCommand {
    constructor(elements, dx, dy) {
        this.elements = [...elements];
        this.dx = dx;
        this.dy = dy;
    }
    execute() { this.elements.forEach(el => { el.x += this.dx; el.y += this.dy; }); this.updateUI(); }
    undo() { this.elements.forEach(el => { el.x -= this.dx; el.y -= this.dy; }); this.updateUI(); }
    updateUI() {
        this.elements.forEach(el => {
            const wrapper = el.wrapper;
            if (wrapper) {
                wrapper.querySelector('.posX').value = el.x;
                wrapper.querySelector('.posY').value = el.y;
            }
        });
        updatePreviewAndCode();
    }
}

class PropertyChangeCommand {
    constructor(targets, property, newValue, oldValue) {
        this.targets = Array.isArray(targets) ? [...targets] : [targets];
        this.property = property;
        this.newValue = newValue;
        this.oldValue = oldValue;
    }
    execute() { this.targets.forEach(el => el[this.property] = this.newValue); this.updateUI(); }
    undo() { this.targets.forEach(el => el[this.property] = this.oldValue); this.updateUI(); }
    updateUI() {
        this.targets.forEach(target => {
            if (target && typeof target.render === 'function') {
                target.render();
            }
        });
        updatePreviewAndCode();
        renderLayers();
    }
}

class DeleteCommand {
    constructor(elements) {
        this.elements = [...elements];
        this.indices = new Map();
        elements.forEach(el => {
            this.indices.set(el.id, layerOrder.findIndex(item => item.id === el.id));
        });
    }
    execute() {
        this.elements.forEach(el => {
            const layerIndex = layerOrder.findIndex(item => item.id === el.id);
            if (layerIndex > -1) layerOrder.splice(layerIndex, 1);
            el.wrapper.style.display = 'none';
        });
        selectionList = [];
        this.updateUI();
    }
    undo() {
        this.elements.forEach(el => {
            const index = this.indices.get(el.id);
            layerOrder.splice(index, 0, el);
            el.wrapper.style.display = 'block';
        });
        selectionList = this.elements;
        this.updateUI();
    }
    updateUI() { renderLayers(); updatePreviewAndCode(); updateAlignmentToolbarVisibility(); }
}

class ReorderCommand {
    constructor(element, newIndex, oldIndex) {
        this.element = element;
        this.newIndex = newIndex;
        this.oldIndex = oldIndex;
    }
    execute() {
        layerOrder.splice(this.oldIndex, 1);
        layerOrder.splice(this.newIndex, 0, this.element);
        this.updateUI();
    }
    undo() {
        layerOrder.splice(this.newIndex, 1);
        layerOrder.splice(this.oldIndex, 0, this.element);
        this.updateUI();
    }
    updateUI() { renderLayers(); updatePreviewAndCode(); }
}

class AddAnimationStepCommand {
    constructor(element, stepData) {
        this.element = element;
        this.stepData = stepData;
    }
    execute() {
        this.element.animationSteps.push(this.stepData);
        this.element.renderAnimationSteps();
        updatePreviewAndCode();
    }
    undo() {
        this.element.animationSteps.pop();
        this.element.renderAnimationSteps();
        updatePreviewAndCode();
    }
}

class RemoveAnimationStepCommand {
    constructor(element, stepData, index) {
        this.element = element;
        this.stepData = stepData;
        this.index = index;
    }
    execute() {
        this.element.animationSteps.splice(this.index, 1);
        this.element.renderAnimationSteps();
        updatePreviewAndCode();
    }
    undo() {
        this.element.animationSteps.splice(this.index, 0, this.stepData);
        this.element.renderAnimationSteps();
        updatePreviewAndCode();
    }
}


// --- HISTORY MANAGER ---
const undoStack = [];
const redoStack = [];

const history = {
    do(command) {
        command.execute();
        undoStack.push(command);
        redoStack.length = 0; 
        updateUndoRedoButtons();
    },
    undo() {
        if (undoStack.length > 0) {
            const command = undoStack.pop();
            command.undo();
            redoStack.push(command);
            updateUndoRedoButtons();
        }
    },
    redo() {
        if (redoStack.length > 0) {
            const command = redoStack.pop();
            command.execute();
            undoStack.push(command);
            updateUndoRedoButtons();
        }
    }
};

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}