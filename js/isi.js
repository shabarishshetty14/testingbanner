/* -----------------------------
   ISI Enable/Disable + Scroll Logic
------------------------------ */

document.getElementById('enableIsiCheckbox')
  .addEventListener('change', updatePreviewAndCode);

function initIsiScroll() {
  const isiEnabled = document.getElementById('enableIsiCheckbox').checked;
  if (!isiEnabled) return;

  const scrollDiv = document.getElementById('scroll_tj');
  if (!scrollDiv) return;

  // Clear any existing scroll intervals to prevent duplicates
  if (window.isiScrollInterval) clearInterval(window.isiScrollInterval);
  if (window.isiScrollStartTimeout) clearTimeout(window.isiScrollStartTimeout);

  let ScrollRate = 125;
  let ReachedMaxScroll = false;
  let PreviousScrollTop = 0;
  let scrollStarted = false;

  function scrollDiv_init() {
    ReachedMaxScroll = false;
    scrollDiv.scrollTop = 0;
    PreviousScrollTop = 0;
    const totalDuration = getTotalDuration();
    window.isiScrollStartTimeout = setTimeout(startScroll, totalDuration * 1000);
  }

  function startScroll() {
    scrollStarted = true;
    window.isiScrollInterval = setInterval(scrollStep, ScrollRate);
  }

  function scrollStep() {
    if (!ReachedMaxScroll) {
      scrollDiv.scrollTop = PreviousScrollTop;
      PreviousScrollTop++;
      ReachedMaxScroll = scrollDiv.scrollTop >= (scrollDiv.scrollHeight - scrollDiv.offsetHeight);
    } else {
        clearInterval(window.isiScrollInterval);
    }
  }

  function pauseDiv() {
    clearInterval(window.isiScrollInterval);
  }

  function resumeDiv() {
    PreviousScrollTop = scrollDiv.scrollTop;
    window.isiScrollInterval = setInterval(scrollStep, ScrollRate);
  }

  function getTotalDuration() {
    let totalDuration = 0;
    layerOrder.forEach(item => {
        if (!item.isVisible) return;
        item.animationSteps.forEach(step => {
            // Calculate duration considering repeats and repeat delays
            let stepDuration = step.duration * (step.advanced.repeat + 1) + (step.advanced.repeat * step.advanced.repeatDelay);
            let endTime = step.delay + stepDuration;
            if (totalDuration < endTime) {
                totalDuration = endTime;
            }
        });
    });
    return totalDuration;
  }

  scrollDiv.onmouseover = () => scrollStarted ? pauseDiv() : null;
  scrollDiv.onmouseout = () => scrollStarted ? resumeDiv() : null;

  scrollDiv_init();
}