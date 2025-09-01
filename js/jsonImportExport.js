function rebuildFromData(data) {
    if (!data.elements || !Array.isArray(data.elements)) throw new Error("Invalid data format for rebuild");

    // Reset current state
    imageList = [];
    textList = [];
    layerOrder = [];
    undoStack.length = 0;
    redoStack.length = 0;
    document.getElementById('controls').innerHTML = '';
    
    widthInput.value = data.bannerWidth || 300;
    heightInput.value = data.bannerHeight || 250;
    updateBannerSize();

    // --- NEW: Restore Custom ISI values ---
    if (data.isiCustom) {
        document.getElementById('isiWidthInput').value = data.isiCustom.width || '';
        document.getElementById('isiHeightInput').value = data.isiCustom.height || '';
        document.getElementById('isiTopInput').value = data.isiCustom.top || '';
        document.getElementById('isiLeftInput').value = data.isiCustom.left || '';
    }

    // Rebuild elements from the data
    data.elements.forEach((itemData) => {
        if (itemData.type === 'image') {
            createControlBlock(imageList.length);
            const newImage = imageList[imageList.length - 1];
            Object.assign(newImage, { ...itemData, wrapper: newImage.wrapper, previewImg: null });
            updateImageControlUI(newImage);

        } else if (itemData.type === 'text') {
            createTextControlBlock(textList.length);
            const newText = textList[textList.length - 1];
            Object.assign(newText, { ...itemData, wrapper: newText.wrapper, previewElement: null });
            updateTextControlUI(newText);
        }
    });
    
    // Final UI refresh
    renderLayers();
    updatePreviewAndCode();
    updateUndoRedoButtons();
}


/* -----------------------------
   JSON Import / Export
------------------------------ */

document.getElementById('downloadJsonBtn').addEventListener('click', () => {
  const jsonData = {
    bannerWidth: parseInt(widthInput.value) || 300,
    bannerHeight: parseInt(heightInput.value) || 250,
    elements: layerOrder.map(item => {
      const { wrapper, ...rest } = item;
      return rest;
    })
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "bannercraft_project.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importJsonInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      rebuildFromData(data);
    } catch (err) {
      alert("Failed to import JSON: " + err.message);
    }
  };
  reader.readAsText(file);
});