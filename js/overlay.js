function initOverlay() {
    const overlayImageInput = document.getElementById('overlayImageInput');
    const overlayOpacitySlider = document.getElementById('overlayOpacitySlider');
    let traceOverlay = null;

    // Function to show/hide remove button
    function toggleRemoveButton(show) {
        const removeBtn = document.getElementById('removeOverlayBtn');
        if (removeBtn) {
            removeBtn.style.display = show ? 'block' : 'none';
        }
    }

    overlayImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            removeOverlay();
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (!traceOverlay) {
                traceOverlay = document.createElement('div');
                traceOverlay.id = 'trace-overlay';
                previewArea.appendChild(traceOverlay);
            }
            traceOverlay.style.backgroundImage = `url(${event.target.result})`;
            traceOverlay.style.opacity = overlayOpacitySlider.value;
            toggleRemoveButton(true); // Show remove button
        };
        reader.readAsDataURL(file);
    });

    overlayOpacitySlider.addEventListener('input', () => {
        if (traceOverlay) {
            traceOverlay.style.opacity = overlayOpacitySlider.value;
        }
    });

    function removeOverlay() {
        if (traceOverlay) {
            previewArea.removeChild(traceOverlay);
            traceOverlay = null;
        }
        toggleRemoveButton(false); // Hide remove button
    }

    // Add remove button functionality
    const removeBtn = document.getElementById('removeOverlayBtn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            overlayImageInput.value = ''; // Clear file input
            removeOverlay();
        });
    }
}
