/* -----------------------------
   Banner Size Controls
------------------------------ */
const bannerWidthInput = document.getElementById('bannerWidthInput');
const bannerHeightInput = document.getElementById('bannerHeightInput');

function updateBannerSize() {
  const width = parseInt(bannerWidthInput.value) || 300;
  const height = parseInt(bannerHeightInput.value) || 250;
  previewArea.style.width = width + "px";
  previewArea.style.height = height + "px";
  updatePreviewAndCode();
}

bannerWidthInput.addEventListener('input', updateBannerSize);
bannerHeightInput.addEventListener('input', updateBannerSize);