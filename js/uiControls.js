function getEaseOptions() {
    const eases = ['none', 'power1.in', 'power1.out', 'power1.inOut', 'power2.in', 'power2.out', 'power2.inOut', 'power3.in', 'power3.out', 'power3.inOut', 'power4.in', 'power4.out', 'power4.inOut', 'back.in', 'back.out', 'back.inOut', 'bounce.in', 'bounce.out', 'bounce.inOut', 'circ.in', 'circ.out', 'circ.inOut', 'elastic.in', 'elastic.out', 'elastic.inOut', 'expo.in', 'expo.out', 'expo.inOut', 'sine.in', 'sine.out', 'sine.inOut'];
    return eases.map(ease => `<option value="${ease}" ${ease === 'power1.out' ? 'selected' : ''}>${ease}</option>`).join('');
}

function createControlBlock(index) {
  const controls = document.getElementById('controls');
  const id = `img${Date.now()}_${index}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'asset-block';
  wrapper.innerHTML = `
    <div class="asset-header">
      <strong>Image ${index + 1}</strong>
      <button class="icon-btn collapse-btn" title="Collapse Panel"><i class="fas fa-chevron-up"></i></button>
    </div>
    <div class="asset-content">
      <input type="file" class="imageUpload" accept="image/*" />
      <span class="fileNameDisplay"></span><br />
      <label>Export Filename: <input type="text" class="customFileName" placeholder="e.g., hero-image.png" /></label>
      <label>Alt Text: <input type="text" class="altText" placeholder="Describe the image" /></label>
      <div class="dimension-controls">
          <label>W: <input type="number" class="imgWidth" value="100" /></label>
          <button class="icon-btn aspect-ratio-lock active" title="Lock Aspect Ratio"><i class="fas fa-link"></i></button>
          <label>H: <input type="number" class="imgHeight" value="100" /></label>
      </div>
      <div class="coords">
        <label>X: <input type="number" class="posX" value="0" /></label>
        <label>Y: <input type="number" class="posY" value="0" /></label>
      </div>
      <label class="checkbox-control"><input type="checkbox" class="clickTag"> <i class="fa-solid fa-mouse-pointer"></i> Click Tag</label>
      <div class="click-tag-url" style="display: none;">
        <label>Click URL: <input type="url" class="clickUrl" value="https://example.com" /></label>
        <label>Target: <select class="clickTarget"><option value="_blank">New Window</option><option value="_self">Same Window</option></select></label>
      </div>
      <div class="animation-steps-container"></div>
      <button class="addAnimStepBtn">+ Add Animation Step</button>
    </div>
  `;
  controls.appendChild(wrapper);

  const imageData = {
    id, type: 'image', fileName: '', customFileName: '', src: '', customName: null, 
    thumbnailSrc: null, alt: '', x: 0, y: 0, width: 100, height: 100, aspectRatio: 1,
    animationSteps: [], previewImg: null, isVisible: true, isLocked: false,
    clickTag: false, clickUrl: 'https://example.com', clickTarget: '_blank', wrapper,
    aspectRatioLocked: true,
    render: function() { updateImageControlUI(this); },
    renderAnimationSteps: function() { renderAnimationSteps(this, wrapper); }
  };
  imageList.push(imageData);
  layerOrder.push(imageData);

  wrapper.querySelector('.collapse-btn').addEventListener('click', () => { wrapper.classList.toggle('collapsed'); });
  
  wrapper.addEventListener('click', (e) => {
    if (e.target.closest('button, input, select, .fileNameDisplay, .asset-header')) return;
    selectionList = [imageData];
    activeDragTarget = { imgData: imageData, textData: null, animIndex: null };
    highlightPreview();
    renderLayers();
    updateAlignmentToolbarVisibility();
  });

  const propertyMap = { '.posX': 'x', '.posY': 'y', '.imgWidth': 'width', '.imgHeight': 'height', '.altText': 'alt', '.customFileName': 'customFileName', '.clickTag': 'clickTag', '.clickUrl': 'clickUrl', '.clickTarget': 'clickTarget'};
  wrapper.querySelectorAll('input, select').forEach(input => {
      let oldValue;
      input.addEventListener('focus', () => { oldValue = input.type === 'checkbox' ? input.checked : input.value; });
      input.addEventListener('change', (e) => {
          const selector = '.' + e.target.className.split(' ')[0];
          const prop = propertyMap[selector];
          if (!prop) return;
          let newValue;
          if (e.target.type === 'checkbox') { newValue = e.target.checked; } 
          else if (e.target.type === 'number') { newValue = parseInt(e.target.value); } 
          else { newValue = e.target.value; }
          const oldValParsed = input.type === 'checkbox' ? oldValue === 'true' : (isNaN(parseFloat(oldValue)) ? oldValue : parseFloat(oldValue));
          const elementsToChange = selectionList.length > 0 && selectionList.includes(imageData) ? selectionList.filter(item => item.type === 'image') : [imageData];
          if (oldValParsed !== newValue) { history.do(new PropertyChangeCommand(elementsToChange, prop, newValue, oldValParsed)); }
      });
  });
  
  const widthInput = wrapper.querySelector('.imgWidth');
  const heightInput = wrapper.querySelector('.imgHeight');
  const lockButton = wrapper.querySelector('.aspect-ratio-lock');
  lockButton.addEventListener('click', () => {
      imageData.aspectRatioLocked = !imageData.aspectRatioLocked;
      lockButton.classList.toggle('active', imageData.aspectRatioLocked);
      lockButton.querySelector('i').className = imageData.aspectRatioLocked ? 'fas fa-link' : 'fas fa-unlink';
  });
  widthInput.addEventListener('input', () => {
      if (imageData.aspectRatioLocked && imageData.aspectRatio) {
          const newWidth = parseInt(widthInput.value) || 0;
          const newHeight = Math.round(newWidth / imageData.aspectRatio);
          if(imageData.height !== newHeight) history.do(new PropertyChangeCommand([imageData], 'height', newHeight, imageData.height));
      }
  });
  heightInput.addEventListener('input', () => {
      if (imageData.aspectRatioLocked && imageData.aspectRatio) {
          const newHeight = parseInt(heightInput.value) || 0;
          const newWidth = Math.round(newHeight * imageData.aspectRatio);
          if(imageData.width !== newWidth) history.do(new PropertyChangeCommand([imageData], 'width', newWidth, imageData.width));
      }
  });

  const clickTagCheckbox = wrapper.querySelector('.clickTag');
  clickTagCheckbox.addEventListener('change', () => { wrapper.querySelector('.click-tag-url').style.display = clickTagCheckbox.checked ? 'block' : 'none'; });

  wrapper.querySelector('.addAnimStepBtn').addEventListener('click', () => {
      const newStep = {
          type: 'to', delay: 1, duration: 1, ease: 'power1.out',
          from: { x: 0, y: 0, opacity: 0, scale: 1, rotation: 0, skewX: 0, skewY: 0 },
          to: { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, skewX: 0, skewY: 0 },
          advanced: { repeat: 0, yoyo: false, repeatDelay: 0 }
      };
      history.do(new AddAnimationStepCommand(imageData, newStep));
  });

  const fileInput = wrapper.querySelector('.imageUpload');
  fileInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const oldName = imageData.fileName;
      const oldSrc = imageData.src;
      const oldThumb = imageData.thumbnailSrc;
      createThumbnail(file, (thumbnail) => {
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                  const oldWidth = imageData.width;
                  const oldHeight = imageData.height;
                  const newAspectRatio = img.width / img.height;
                  history.do({
                      execute: () => { 
                          imageData.src = event.target.result; 
                          imageData.fileName = file.name; 
                          imageData.thumbnailSrc = thumbnail; 
                          imageData.width = img.width; 
                          imageData.height = img.height; 
                          imageData.aspectRatio = newAspectRatio; 
                          imageData.render(); 
                          // --- FIX: Add these two lines ---
                          renderLayers();
                          updatePreviewAndCode();
                      },
                      undo: () => { 
                          imageData.src = oldSrc; 
                          imageData.fileName = oldName; 
                          imageData.thumbnailSrc = oldThumb; 
                          imageData.width = oldWidth; 
                          imageData.height = oldHeight; 
                          imageData.aspectRatio = oldWidth / oldHeight; 
                          imageData.render();
                          // --- FIX: Add these two lines ---
                          renderLayers();
                          updatePreviewAndCode();
                      }
                  });
              };
              img.src = event.target.result;
          };
          reader.readAsDataURL(file);
      });
  });

  imageData.renderAnimationSteps();
  renderLayers();
  updatePreviewAndCode();
}

function renderAnimationSteps(elementData, wrapper) {
    const container = wrapper.querySelector('.animation-steps-container');
    container.innerHTML = '';
    elementData.animationSteps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'animation-step';
        const fromStateDisplay = step.type === 'fromTo' || step.type === 'from' ? 'grid' : 'none';
        const toStateDisplay = step.type === 'fromTo' || step.type === 'to' || step.type === 'set' ? 'grid' : 'none';

        stepDiv.innerHTML = `
            <div class="step-header">
                <strong>Step ${index + 1}</strong>
                <button class="remove-btn icon-btn" title="Remove Step"><i class="fas fa-times"></i></button>
            </div>
            <div class="step-grid">
                <div class="step-grid-full">
                    <label>Type: 
                        <select class="step-type">
                            <option value="to" ${step.type === 'to' ? 'selected' : ''}>To</option>
                            <option value="from" ${step.type === 'from' ? 'selected' : ''}>From</option>
                            <option value="fromTo" ${step.type === 'fromTo' ? 'selected' : ''}>From/To</option>
                            <option value="set" ${step.type === 'set' ? 'selected' : ''}>Set</option>
                        </select>
                    </label>
                </div>
                
                <div class="step-state-group from-state" style="display: ${fromStateDisplay};">
                    <strong>Start State</strong>
                    <label>X: <input type="number" class="step-from-x" value="${step.from.x}"></label>
                    <label>Y: <input type="number" class="step-from-y" value="${step.from.y}"></label>
                    <label>Opacity: <input type="number" class="step-from-opacity" value="${step.from.opacity}" step="0.1"></label>
                    <label>Scale: <input type="number" class="step-from-scale" value="${step.from.scale}" step="0.1"></label>
                    <label>Rotation: <input type="number" class="step-from-rotation" value="${step.from.rotation}"></label>
                    <label>Skew X: <input type="number" class="step-from-skewX" value="${step.from.skewX || 0}"></label>
                    <label>Skew Y: <input type="number" class="step-from-skewY" value="${step.from.skewY || 0}"></label>
                </div>

                <div class="step-state-group to-state" style="display: ${toStateDisplay};">
                    <strong>End State</strong>
                    <label>X: <input type="number" class="step-to-x" value="${step.to.x}"></label>
                    <label>Y: <input type="number" class="step-to-y" value="${step.to.y}"></label>
                    <label>Opacity: <input type="number" class="step-to-opacity" value="${step.to.opacity}" step="0.1"></label>
                    <label>Scale: <input type="number" class="step-to-scale" value="${step.to.scale}" step="0.1"></label>
                    <label>Rotation: <input type="number" class="step-to-rotation" value="${step.to.rotation}"></label>
                    <label>Skew X: <input type="number" class="step-to-skewX" value="${step.to.skewX || 0}"></label>
                    <label>Skew Y: <input type="number" class="step-to-skewY" value="${step.to.skewY || 0}"></label>
                </div>

                <div class="step-grid-full">
                    <label>Delay: <input type="number" class="step-delay" value="${step.delay}" step="0.1"></label>
                    <label>Duration: <input type="number" class="step-duration" value="${step.duration}" step="0.1"></label>
                    <label>Ease: <select class="step-ease">${getEaseOptions()}</select></label>
                </div>

                <div class="step-grid-full step-advanced-options">
                    <label>Repeat: <input type="number" class="step-advanced-repeat" value="${step.advanced.repeat}"></label>
                    <label>Repeat Delay: <input type="number" class="step-advanced-repeatDelay" value="${step.advanced.repeatDelay}" step="0.1"></label>
                    <label><input type="checkbox" class="step-advanced-yoyo" ${step.advanced.yoyo ? 'checked' : ''}> Yoyo</label>
                </div>
            </div>
        `;
        
        stepDiv.querySelector('.step-ease').value = step.ease;
        container.appendChild(stepDiv);
        
        stepDiv.querySelector('.remove-btn').addEventListener('click', () => { history.do(new RemoveAnimationStepCommand(elementData, step, index)); });
        stepDiv.querySelector('.step-type').addEventListener('change', (e) => { history.do(new PropertyChangeCommand(step, 'type', e.target.value, step.type)); });

        stepDiv.querySelectorAll('input, select').forEach(input => {
            if (input.classList.contains('step-type')) return;
            let oldValue;
            input.addEventListener('focus', () => { oldValue = input.type === 'checkbox' ? input.checked : input.value; });
            input.addEventListener('change', (e) => {
                const parts = e.target.className.replace('step-', '').split('-');
                const prop = parts.pop();
                const stateGroup = parts.length > 0 ? parts.join('-') : null;
                let targetObject = step;
                if (stateGroup === 'from' || stateGroup === 'to') { targetObject = step[stateGroup]; }
                else if (stateGroup === 'advanced') { targetObject = step.advanced; }
                let newValue;
                if (e.target.type === 'checkbox') { newValue = e.target.checked; }
                else if (e.target.type === 'number') { newValue = ['opacity', 'scale', 'duration', 'delay', 'repeatDelay'].includes(prop) ? parseFloat(e.target.value) : parseInt(e.target.value); }
                else { newValue = e.target.value; }
                const oldValParsed = input.type === 'checkbox' ? oldValue === 'true' : (isNaN(parseFloat(oldValue)) ? oldValue : parseFloat(oldValue));
                if (oldValParsed !== newValue) { history.do(new PropertyChangeCommand(targetObject, prop, newValue, oldValParsed)); }
            });
        });
    });
}

document.getElementById('addImageBtn').addEventListener('click', () => { createControlBlock(imageList.length); });

function updateImageControlUI(imageData) {
    const wrapper = imageData.wrapper;
    if (!wrapper) return;
    wrapper.querySelector('.posX').value = imageData.x;
    wrapper.querySelector('.posY').value = imageData.y;
    wrapper.querySelector('.imgWidth').value = imageData.width;
    wrapper.querySelector('.imgHeight').value = imageData.height;
    wrapper.querySelector('.altText').value = imageData.alt;
    wrapper.querySelector('.customFileName').value = imageData.customFileName;
    wrapper.querySelector('.clickTag').checked = imageData.clickTag;
    wrapper.querySelector('.clickUrl').value = imageData.clickUrl;
    wrapper.querySelector('.clickTarget').value = imageData.clickTarget;
    wrapper.querySelector('.fileNameDisplay').textContent = imageData.fileName;
    if (imageData.clickTag) { wrapper.querySelector('.click-tag-url').style.display = 'block'; }
    const lockButton = wrapper.querySelector('.aspect-ratio-lock');
    lockButton.classList.toggle('active', imageData.aspectRatioLocked);
    lockButton.querySelector('i').className = imageData.aspectRatioLocked ? 'fas fa-link' : 'fas fa-unlink';
}

