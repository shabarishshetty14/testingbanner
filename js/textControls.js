function createTextControlBlock(index) {
  const controls = document.getElementById('controls');
  const id = `text${Date.now()}_${index}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'asset-block';
  wrapper.innerHTML = `
    <div class="asset-header">
      <strong>Text ${index + 1}</strong>
      <button class="icon-btn collapse-btn" title="Collapse Panel"><i class="fas fa-chevron-up"></i></button>
    </div>
    <div class="asset-content">
      <div class="coords">
        <label>X: <input type="number" class="posX" value="0" /></label>
        <label>Y: <input type="number" class="posY" value="0" /></label>
      </div>
      <label>Text Content: <input type="text" class="textContent" value="Sample Text" /></label>
      <label>Font Size: <input type="number" class="fontSize" value="16" />px</label>
      <label>Font Family: 
        <select class="fontFamily">
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
        </select>
      </label>
      <label>Color: <input type="color" class="textColor" value="#000000" /></label>
      <label>Font Weight: 
        <select class="fontWeight">
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
        </select>
      </label>
      <label>Width: <input type="number" class="textWidth" value="200" /></label>
      <label class="checkbox-control"><input type="checkbox" class="clickTag"> <i class="fa-solid fa-mouse-pointer"></i> Click Tag</label>
      <div class="click-tag-url" style="display: none;">
        <label>Click URL: <input type="url" class="clickUrl" value="https://example.com" /></label>
        <label>Target: 
          <select class="clickTarget">
            <option value="_blank">New Window (_blank)</option>
            <option value="_self">Same Window (_self)</option>
          </select>
        </label>
      </div>
      <div class="animation-steps-container"></div>
      <button class="addAnimStepBtn">+ Add Animation Step</button>
      <button class="removeText">Remove Text</button>
    </div>
  `;
  controls.appendChild(wrapper);

  const textData = {
    id, type: 'text', content: 'Sample Text', customName: null,
    x: 0, y: 0, width: 200, fontSize: 16, fontFamily: 'Arial, sans-serif', 
    fontWeight: 'normal', color: '#000000', animationSteps: [],
    previewElement: null, isVisible: true, isLocked: false,
    clickTag: false, clickUrl: 'https://example.com', clickTarget: '_blank', wrapper,
    render: function() { updateTextControlUI(this); },
    renderAnimationSteps: function() { renderAnimationSteps(this, wrapper); }
  };
  textList.push(textData);
  layerOrder.push(textData);
  

  wrapper.querySelector('.collapse-btn').addEventListener('click', () => { wrapper.classList.toggle('collapsed'); });

  wrapper.addEventListener('click', (e) => {
    if (e.target.closest('button, input, select, .asset-header')) return;
    selectionList = [textData];
    activeDragTarget = { imgData: null, textData: textData, animIndex: null };
    highlightPreview();
    renderLayers();
    updateAlignmentToolbarVisibility();
  });

  const propertyMap = { '.posX': 'x', '.posY': 'y', '.textWidth': 'width', '.textContent': 'content', '.fontSize': 'fontSize', '.fontFamily': 'fontFamily', '.fontWeight': 'fontWeight', '.textColor': 'color', '.clickTag': 'clickTag', '.clickUrl': 'clickUrl', '.clickTarget': 'clickTarget' };
  
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
          const elementsToChange = selectionList.length > 0 && selectionList.includes(textData) ? selectionList.filter(item => item.type === 'text') : [textData];
          if (oldValParsed !== newValue) { history.do(new PropertyChangeCommand(elementsToChange, prop, newValue, oldValParsed)); }
      });
  });
  
  const clickTagCheckbox = wrapper.querySelector('.clickTag');
  clickTagCheckbox.addEventListener('change', () => {
      wrapper.querySelector('.click-tag-url').style.display = clickTagCheckbox.checked ? 'block' : 'none';
  });
  
  wrapper.querySelector('.removeText').addEventListener('click', (e) => {
    e.stopPropagation();
    history.do(new DeleteCommand([textData]));
  });

  wrapper.querySelector('.addAnimStepBtn').addEventListener('click', () => {
      const newStep = {
          type: 'to', delay: 1, duration: 1, ease: 'power1.out',
          from: { x: 0, y: 0, opacity: 0, scale: 1, rotation: 0, skewX: 0, skewY: 0 },
          to: { x: 0, y: 0, opacity: 1, scale: 1, rotation: 0, skewX: 0, skewY: 0 },
          advanced: { repeat: 0, yoyo: false, repeatDelay: 0 }
      };
      history.do(new AddAnimationStepCommand(textData, newStep));
  });

  textData.renderAnimationSteps();
  renderLayers();
  updatePreviewAndCode();
}

document.getElementById('addTextBtn').addEventListener('click', () => {
  createTextControlBlock(textList.length);
});

function updateTextControlUI(textData) {
    const wrapper = textData.wrapper;
    if (!wrapper) return;
    wrapper.querySelector('.posX').value = textData.x;
    wrapper.querySelector('.posY').value = textData.y;
    wrapper.querySelector('.textContent').value = textData.content;
    wrapper.querySelector('.fontSize').value = textData.fontSize;
    wrapper.querySelector('.fontFamily').value = textData.fontFamily;
    wrapper.querySelector('.fontWeight').value = textData.fontWeight;
    wrapper.querySelector('.textColor').value = textData.color;
    wrapper.querySelector('.textWidth').value = textData.width;
    wrapper.querySelector('.clickTag').checked = textData.clickTag;
    wrapper.querySelector('.clickUrl').value = textData.clickUrl;
    wrapper.querySelector('.clickTarget').value = textData.clickTarget;
    const clickTagUrl = wrapper.querySelector('.click-tag-url');
    clickTagUrl.style.display = textData.clickTag ? 'block' : 'none';
}