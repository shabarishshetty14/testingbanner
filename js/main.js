/* -----------------------------
   App Entry Point
------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
  initContextMenu();
  initOverlay(); 
  updateUndoRedoButtons();
  
  const savedStateJSON = localStorage.getItem('bannerCraftAutoSave');
  if (savedStateJSON) {
      if (confirm("It looks like you have an unsaved session. Would you like to restore it?")) {
          try {
              const savedState = JSON.parse(savedStateJSON);
              rebuildFromData(savedState);
          } catch (error) {
              console.error("Failed to restore session:", error);
              localStorage.removeItem('bannerCraftAutoSave');
          }
      } else {
        localStorage.removeItem('bannerCraftAutoSave');
      }
  } else {
    // If no saved state, initialize with defaults
    updateBannerSize();
    renderLayers();
    updateAlignmentToolbarVisibility();
  }
});

// Theme Switcher Logic
const themeToggleButton = document.getElementById('theme-toggle-btn');
const toggleIcon = themeToggleButton.querySelector('i');
const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.dataset.theme = 'dark';
        toggleIcon.classList.remove('fa-moon');
        toggleIcon.classList.add('fa-sun');
    } else {
        delete document.body.dataset.theme;
        toggleIcon.classList.remove('fa-sun');
        toggleIcon.classList.add('fa-moon');
    }
};
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
applyTheme(currentTheme);
themeToggleButton.addEventListener('click', () => {
    const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});


// Left Panel Collapse/Expand Logic
const toggleBtn = document.getElementById('toggleLeftPanel');
const leftPanel = document.getElementById('leftPanel');

toggleBtn.addEventListener('click', () => {
    const isCollapsed = leftPanel.classList.toggle('collapsed');
    const icon = toggleBtn.querySelector('i');
    
    if (isCollapsed) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
        toggleBtn.title = "Expand Panel";
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
        toggleBtn.title = "Collapse Panel";
    }
});

// ISI Editor button and Custom Controls visibility
document.getElementById('enableIsiCheckbox').addEventListener('change', function() {
  const editBtn = document.getElementById('editIsiBtn');
  const customControls = document.getElementById('isi-custom-controls');
  
  const displayValue = this.checked ? 'block' : 'none';
  editBtn.style.display = displayValue;
  customControls.style.display = displayValue;
  
  updatePreviewAndCode();
});
document.getElementById('editIsiBtn').addEventListener('click', () => {
  showISIEditor();
});

// =============================================
//   GLOBAL KEYBOARD CONTROLS (Nudge & Delete)
// =============================================
function handleGlobalKeyDown(e) {
    const activeDOMElement = document.activeElement;
    if (activeDOMElement.tagName === 'INPUT' || activeDOMElement.tagName === 'TEXTAREA' || activeDOMElement.tagName === 'SELECT') {
        return;
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && selectionList.length > 0) {
        e.preventDefault();
        history.do(new DeleteCommand(selectionList));
        return;
    }

    if (selectionList.length === 0) return;

    const moveAmount = e.shiftKey ? 10 : 1;
    let dx = 0, dy = 0;
    switch (e.key) {
        case 'ArrowUp': dy = -moveAmount; break;
        case 'ArrowDown': dy = moveAmount; break;
        case 'ArrowLeft': dx = -moveAmount; break;
        case 'ArrowRight': dx = moveAmount; break;
    }

    if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const elementsToNudge = selectionList.filter(el => !el.isLocked);
        if (elementsToNudge.length > 0) {
            history.do(new MoveCommand(elementsToNudge, dx, dy));
        }
    }
}

document.addEventListener('keydown', handleGlobalKeyDown);

// =============================================
//   UNDO / REDO CONTROLS
// =============================================
document.getElementById('undo-btn').addEventListener('click', () => history.undo());
document.getElementById('redo-btn').addEventListener('click', () => history.redo());

document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (e.ctrlKey || e.metaKey) {
        let handled = false;
        if (e.key.toLowerCase() === 'z') { history.undo(); handled = true; } 
        else if (e.key.toLowerCase() === 'y') { history.redo(); handled = true; }
        if (handled) { e.preventDefault(); }
    }
});

// =============================================
//   AUTO-SAVING TO LOCALSTORAGE
// =============================================
function saveState() {
    if (layerOrder.length === 0 && !document.getElementById('enableIsiCheckbox').checked) {
        localStorage.removeItem('bannerCraftAutoSave');
        return;
    }
    try {
        const state = {
            bannerWidth: parseInt(widthInput.value) || 300,
            bannerHeight: parseInt(heightInput.value) || 250,
            isiCustom: {
                width: document.getElementById('isiWidthInput').value,
                height: document.getElementById('isiHeightInput').value,
                top: document.getElementById('isiTopInput').value,
                left: document.getElementById('isiLeftInput').value,
            },
            elements: layerOrder.map(item => {
                const { wrapper, previewImg, previewElement, ...rest } = item;
                return rest;
            })
        };
        localStorage.setItem('bannerCraftAutoSave', JSON.stringify(state));
    } catch (error) {
        console.error("Error auto-saving state:", error);
    }
}
setInterval(saveState, 5000);


// --- ISI Custom Input Listeners ---
const isiCustomInputs = ['isiWidthInput', 'isiHeightInput', 'isiTopInput', 'isiLeftInput'];
isiCustomInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', updatePreviewAndCode);
    }
});