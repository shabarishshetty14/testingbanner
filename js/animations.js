/* -----------------------------
   Reanimate (Builder Preview)
------------------------------ */

function reanimate() {
  selectionList = [];
  activeDragTarget = { imgData: null, textData: null, animIndex: null };
  renderLayers();
  highlightPreview();
  updateAlignmentToolbarVisibility();
  
  gsap.killTweensOf("*");
  
  // --- FIX: Establish the correct initial state for each element BEFORE creating the timeline ---
  layerOrder.forEach(item => {
    if (!item.isVisible) return;
    const el = item.previewImg || item.previewElement;
    if (!el) return;

    const firstStep = item.animationSteps[0];
    
    // Set the base position and default visual properties
    let initialState = {
      x: 0, // GSAP transforms are relative, so we start them at 0
      y: 0,
      left: item.x, // Position the element's container using left/top
      top: item.y,
      opacity: 1,
      scale: 1,
      rotation: 0,
      skewX: 0,
      skewY: 0
    };

    if (firstStep) {
        // For 'from' or 'fromTo' tweens, the element's starting state IS the 'from' object.
        if (firstStep.type === 'from' || firstStep.type === 'fromTo') {
            // Merge the 'from' properties into our initial state
            Object.assign(initialState, firstStep.from);
        } 
        // For a standard 'to' tween, the element should start at its base position but be invisible.
        else if (firstStep.type === 'to' || firstStep.type === 'set') {
            initialState.opacity = 0;
        }
    }
    
    // Use GSAP to instantly apply this calculated initial state
    gsap.set(el, initialState);
  });
  // --- END FIX ---

  // Now that initial states are correct, we can create and run the timeline
  let tl = gsap.timeline();

  layerOrder.forEach(item => {
    if (!item.isVisible) return;
    
    const el = item.previewImg || item.previewElement;
    if (!el) return;

    // Build the timeline from the animation steps
    item.animationSteps.forEach(step => {
        const fromVars = {
            x: step.from.x,
            y: step.from.y,
            opacity: step.from.opacity,
            scale: step.from.scale,
            rotation: step.from.rotation,
            skewX: step.from.skewX || 0,
            skewY: step.from.skewY || 0
        };

        const toVars = {
            duration: step.duration,
            ease: step.ease,
            x: step.to.x,
            y: step.to.y,
            opacity: step.to.opacity,
            scale: step.to.scale,
            rotation: step.to.rotation,
            skewX: step.to.skewX || 0,
            skewY: step.to.skewY || 0,
            repeat: step.advanced.repeat,
            yoyo: step.advanced.yoyo,
            repeatDelay: step.advanced.repeatDelay
        };

        switch (step.type) {
            case 'fromTo':
                tl.fromTo(el, fromVars, toVars, step.delay);
                break;
            case 'from':
                tl.from(el, { ...fromVars, duration: step.duration, ease: step.ease }, step.delay);
                break;
            case 'set':
                tl.set(el, toVars, step.delay);
                break;
            case 'to':
            default:
                tl.to(el, toVars, step.delay);
                break;
        }
    });
  });
}
