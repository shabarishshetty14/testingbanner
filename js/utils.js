/* -----------------------------
   Shared State
------------------------------ */
let imageList = [];
let textList = [];
let layerOrder = []; // Tracks the render order of all elements
let selectionList = []; // Tracks all selected elements

let activeDragTarget = {
  imgData: null,
  textData: null,
  animIndex: null // null = base, 0+ = extraAnims
};

// Tooltip label element for selected image or animation
const previewArea = document.getElementById('previewArea');
let labelElement = document.createElement('div');
labelElement.className = 'preview-label';
previewArea.appendChild(labelElement);

/* -----------------------------
   Helper Functions
------------------------------ */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function snapToGrid(val, gridSize = 10) {
  return Math.round(val / gridSize) * gridSize;
}

function getImageDataById(id) {
  return imageList.find(img => img.id === id) || null;
}

function getTextDataById(id) {
  return textList.find(text => text.id === id) || null;
}

function highlightPreview() {
    const selectionIds = new Set(selectionList.map(item => item.id));
    document.querySelectorAll('.preview, .preview-text').forEach(el => {
        el.classList.toggle('highlighted', selectionIds.has(el.id));
    });
}

function highlightExtraAnim(wrapper, animIndex) {
  wrapper.querySelectorAll('.extra-anims .exit-controls').forEach((div, i) => {
    div.classList.toggle('selected', i === animIndex);
  });
}

function isGifFile(file) {
  return file && file.type === 'image/gif';
}

function createThumbnail(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxSize = 50;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL());
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function getEaseOptions() {
    const eases = ['none', 'power1.in', 'power1.out', 'power1.inOut', 'power2.in', 'power2.out', 'power2.inOut', 'power3.in', 'power3.out', 'power3.inOut', 'power4.in', 'power4.out', 'power4.inOut', 'back.in', 'back.out', 'back.inOut', 'bounce.in', 'bounce.out', 'bounce.inOut', 'circ.in', 'circ.out', 'circ.inOut', 'elastic.in', 'elastic.out', 'elastic.inOut', 'expo.in', 'expo.out', 'expo.inOut', 'sine.in', 'sine.out', 'sine.inOut'];
    return eases.map(ease => `<option value="${ease}" ${ease === 'power1.out' ? 'selected' : ''}>${ease}</option>`).join('');
}