/* -----------------------------
   Preview Rendering + Generated Code Output
------------------------------ */

function getElementId(item)
{
  if (item.customName) {
    let sanitized = item.customName.trim().replace(/[^a-zA-Z0-9-_]/g, '-');
    if (/^[0-9-]/.test(sanitized)) {
      sanitized = 'id-' + sanitized;
    }
    return sanitized || item.id;
  }
  return item.id;
}

const outputCode = document.getElementById('outputCode');
const widthInput = document.getElementById('bannerWidthInput');
const heightInput = document.getElementById('bannerHeightInput');

document.getElementById('copyCodeBtn').addEventListener('click', () =>
{
  const code = outputCode.textContent;
  navigator.clipboard.writeText(code).then(() =>
  {
    const btn = document.getElementById('copyCodeBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '✅ Copied!';
    setTimeout(() => btn.innerHTML = originalHTML, 2000);
  });
});

function updatePreviewAndCode()
{
  const isiEnabled = document.getElementById('enableIsiCheckbox').checked;

  const bannerW = parseInt(widthInput.value) || 300;
  const bannerH = parseInt(heightInput.value) || 250;

  const existingIsiStyle = document.getElementById('isi-style-tag');
  if (existingIsiStyle) existingIsiStyle.remove();

  if (isiEnabled) {
    const style = document.createElement('style');
    style.id = 'isi-style-tag';
    style.textContent = `/* ISI Styles */` + getIsiCSS(bannerW, bannerH);
    document.head.appendChild(style);
  }

  const existingOverlay = document.getElementById('trace-overlay');
  let overlayData = null;
  if (existingOverlay) {
    overlayData = {
      backgroundImage: existingOverlay.style.backgroundImage,
      opacity: existingOverlay.style.opacity
    };
  }

  previewArea.innerHTML = '';

  // Restore overlay if it existed
  if (overlayData) {
    const overlay = document.createElement('div');
    overlay.id = 'trace-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundSize = 'contain';
    overlay.style.backgroundRepeat = 'no-repeat';
    overlay.style.backgroundPosition = 'center';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '50';
    overlay.style.backgroundImage = overlayData.backgroundImage;
    overlay.style.opacity = overlayData.opacity;
    previewArea.appendChild(overlay);
  }
  const selectionIds = new Set(selectionList.map(item => item.id));

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Generated Banner</title>
<meta name="ad.size" content="width=${ bannerW },height=${ bannerH }">
<style>
* {margin: 0;padding: 0;box-sizing: border-box;user-select: none;outline: 0;}
#banner-wrapper { position: relative; width: ${ bannerW }px; height: ${ bannerH }px; overflow: hidden; background: #eee; border: 1px solid #727479; }
img, .text-element { position: absolute; }
.clickable { cursor: pointer; }
`;

  layerOrder.forEach(item =>
  {
    if (!item.isVisible) return;
    const elementId = getElementId(item);
    const firstAnim = item.animationSteps[0];
    const initialOpacity = (firstAnim && (firstAnim.type === 'from' || firstAnim.type === 'fromTo')) ? firstAnim.from.opacity : 0;

    html += `#${ elementId } { left: ${ item.x }px; top: ${ item.y }px; opacity: ${ initialOpacity }; }\n`;
  });

  html += `</style>\n`;
  if (isiEnabled) html += `<style>${ getIsiCSS(bannerW, bannerH) }</style>\n`;
  html += `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n</head>\n<body>\n<div id="banner-wrapper">\n`;

  layerOrder.forEach(item =>
  {
    if (!item.isVisible) return;
    const elementId = getElementId(item);

    if (item.type === 'image') {
      const clickableClass = item.clickTag ? ' class="clickable"' : '';
      const clickHandler = item.clickTag ? ` onclick="window.open('${ item.clickUrl }', '${ item.clickTarget }')"` : '';
      const exportSrc = item.customFileName || item.fileName;
      html += `<img id="${ elementId }" src="${ exportSrc }" alt="${ item.alt }" style="width:${ item.width }px; height:${ item.height }px;"${ clickableClass }${ clickHandler } />\n`;

      const previewImg = document.createElement('img');
      previewImg.src = item.src;
      previewImg.id = item.id;
      previewImg.className = 'preview' + (item.clickTag ? ' clickable' : '');
      previewImg.style.cssText = `width:${ item.width }px; height:${ item.height }px; left:${ item.x }px; top:${ item.y }px;`;
      if (selectionIds.has(item.id)) previewImg.classList.add("highlighted");
      previewArea.appendChild(previewImg);
      item.previewImg = previewImg;
    } else {
      const clickableClass = item.clickTag ? ' class="text-element clickable"' : ' class="text-element"';
      const clickHandler = item.clickTag ? ` onclick="window.open('${ item.clickUrl }', '${ item.clickTarget }')"` : '';
      html += `<div id="${ elementId }" style="width:${ item.width }px; font-size:${ item.fontSize }px; font-family:${ item.fontFamily }; font-weight:${ item.fontWeight }; color:${ item.color };"${ clickableClass }${ clickHandler }>${ item.content }</div>\n`;

      const previewText = document.createElement('div');
      previewText.textContent = item.content;
      previewText.id = item.id;
      previewText.className = 'preview-text' + (item.clickTag ? ' clickable' : '');
      previewText.style.cssText = `width:${ item.width }px; font-size:${ item.fontSize }px; font-family:${ item.fontFamily }; font-weight:${ item.fontWeight }; color:${ item.color }; left:${ item.x }px; top:${ item.y }px;`;
      if (selectionIds.has(item.id)) previewText.classList.add("highlighted");
      previewArea.appendChild(previewText);
      item.previewElement = previewText;
    }
  });

  if (isiEnabled) html += getIsiHTML(bannerW);
  html += `</div>\n<script>\nfunction startAd() {\nconst tl = gsap.timeline();\n`;

  layerOrder.forEach(item =>
  {
    if (!item.isVisible) return;
    const elementId = getElementId(item);

    item.animationSteps.forEach((step, index) =>
    {
      const fromVars = `{x:${ step.from.x }, y:${ step.from.y }, opacity:${ step.from.opacity }, scale:${ step.from.scale }, rotation:${ step.from.rotation }, skewX:${ step.from.skewX || 0 }, skewY:${ step.from.skewY || 0 }}`;
      const toVars = `{duration:${ step.duration }, ease:'${ step.ease }', x:${ step.to.x }, y:${ step.to.y }, opacity:${ step.to.opacity }, scale:${ step.to.scale }, rotation:${ step.to.rotation }, skewX:${ step.to.skewX || 0 }, skewY:${ step.to.skewY || 0 }, repeat:${ step.advanced.repeat }, yoyo:${ step.advanced.yoyo }, repeatDelay:${ step.advanced.repeatDelay }}`;

      html += `  // Step ${ index + 1 } for ${ elementId }\n`;
      switch (step.type) {
        case 'fromTo':
          html += `  tl.fromTo("#${ elementId }", ${ fromVars }, ${ toVars }, ${ step.delay });\n`;
          break;
        case 'from':
          html += `  tl.from("#${ elementId }", {duration:${ step.duration }, ease:'${ step.ease }', ...${ fromVars }}, ${ step.delay });\n`;
          break;
        case 'set':
          html += `  tl.set("#${ elementId }", ${ toVars }, ${ step.delay });\n`;
          break;
        case 'to':
        default:
          html += `  tl.to("#${ elementId }", ${ toVars }, ${ step.delay });\n`;
          break;
      }
    });
  });

  html += `}\nwindow.addEventListener("load", startAd);\n</script>\n`;
  if (isiEnabled) html += getIsiScrollScript();
  html += `</body>\n</html>`;

  outputCode.textContent = html.trim();
  Prism.highlightElement(outputCode);

  let totalDuration = 0;
  layerOrder.forEach(item =>
  {
    if (!item.isVisible) return;
    item.animationSteps.forEach(step =>
    {
      let stepDuration = step.duration * (step.advanced.repeat + 1) + (step.advanced.repeat * step.advanced.repeatDelay);
      let endTime = step.delay + stepDuration;
      if (totalDuration < endTime) {
        totalDuration = endTime;
      }
    });
  });
  document.getElementById('durationDisplay').textContent = `(${ totalDuration.toFixed(1) }s)`;

  previewArea.appendChild(labelElement);
  labelElement.style.display = 'none';

  if (isiEnabled) {
    const isiWrapper = document.createElement('div');
    isiWrapper.id = 'iframe_tj';
    isiWrapper.innerHTML = getIsiPreviewHTML(bannerW);
    previewArea.appendChild(isiWrapper);
    initIsiScroll();
  }
}

function getIsiCSS(bannerWidth, bannerHeight)
{
  const manualWidth = document.getElementById('isiWidthInput') ? parseInt(document.getElementById('isiWidthInput').value) : null;
  const manualHeight = document.getElementById('isiHeightInput') ? parseInt(document.getElementById('isiHeightInput').value) : null;
  const manualTop = document.getElementById('isiTopInput') ? parseInt(document.getElementById('isiTopInput').value) : null;
  const manualLeft = document.getElementById('isiLeftInput') ? parseInt(document.getElementById('isiLeftInput').value) : null;

  let isiWidth, isiHeight, isiTop, isiLeft, isiRight = 'auto';

  if ([manualWidth, manualHeight, manualTop, manualLeft].every(v => typeof v === 'number' && !isNaN(v))) {
    isiWidth = manualWidth;
    isiHeight = manualHeight;
    isiTop = manualTop;
    isiLeft = manualLeft;
  } else {
    if (bannerWidth >= 728 && bannerHeight <= 90) {
      isiWidth = 155;
      isiHeight = bannerHeight - 1;
      isiTop = 0;
      isiLeft = 'auto';
      isiRight = '0';
    }
    else {
      isiWidth = bannerWidth - 1;
      const calculatedHeight = Math.floor(bannerHeight * 0.28);
      isiHeight = Math.max(69, calculatedHeight);
      isiTop = bannerHeight - isiHeight - 1;
      isiLeft = 0;
      isiRight = 'auto';
    }
  }

  return `
    a{color:#57585a;text-decoration:underline;font-weight:600} a:hover{cursor:pointer} .tel{text-decoration:none;color:#000} p,h1,.isi h2,h3,h4,h5{margin:0} .hyphenate{word-wrap:break-word;overflow-wrap:break-word;-webkit-hyphens:auto;-moz-hyphens:auto;hyphens:auto} .isi{padding:0 2px;box-sizing:border-box} .isi h1{font-family:Arial,sans-serif;font-size:12px;line-height:14px;color:#d50032;text-transform:uppercase;font-weight:700;padding-top:12px} .isi h1 sup{font-size:6px;vertical-align:2px} .isi p{font-family:Arial,sans-serif;color:#63666a;font-size:12px;line-height:14px;margin-bottom:0;text-align:left} .isi .bold{font-weight:700} .isi p .bold-italic{font-weight:700;font-style:italic} .italic{font-style:italic} .isi p.pm2{margin-bottom:4px} .isi p strong{color:#63666a;font-weight:900} .isi p a{color:#d50032;font-weight:400} .isi ul{margin:0;font-family:Arial,sans-serif;color:#63666a;font-size:12px;line-height:13px;list-style:none;padding-left:15px} .isi li{color:#63666a;font-size:12px;line-height:13px;position:relative;margin-left:0} .isi li>span{width:3px;height:3px;background-color:#63666a;border-radius:50%;position:absolute;top:5px;left:-7px}
    #iframe_tj{position:absolute;width:${ isiWidth }px;height:${ isiHeight }px;top:${ isiTop }px;left:${ isiLeft }px;right:${ isiRight }px;border:none;background-color:#fff;z-index:9}
    #scroll_tj{position:absolute;overflow:hidden;width:${ isiWidth }px;height:${ isiHeight }px;overflow-y:scroll;scrollbar-width:auto;scrollbar-color:#63666a #b6b8ba;scroll-behavior:auto} #scroll_tj::-webkit-scrollbar{width:8px} #scroll_tj::-webkit-scrollbar-track{background-color:#ededed} #scroll_tj::-webkit-scrollbar-thumb{background-color:#b3b3b3;border:0;border-left:#ededed 2px;border-right:#ededed 2px;border-style:solid}
    ::-webkit-scrollbar-button:single-button{background-color:#ededed;display:block;background-size:5px;background-repeat:no-repeat} ::-webkit-scrollbar-button:single-button:vertical:decrement{height:6px;width:8px;background-position:center 0;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(180, 180, 180)'><polygon points='50,20 0,100 100,100'/></svg>")} ::-webkit-scrollbar-button:single-button:vertical:decrement:active{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(150, 150, 150)'><polygon points='50,20 0,100 100,100'/></svg>")} ::-webkit-scrollbar-button:single-button:vertical:increment{height:8px;width:8px;background-position:center 0;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(180, 180, 180)'><polygon points='50,100 0,20 100,20'/></svg>")} ::-webkit-scrollbar-button:single-button:vertical:increment:active{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='rgb(150, 150, 150)'><polygon points='50,100 0,20 100,20'/></svg>")}
  `;
}

function getIsiHTML(bannerWidth = 300)
{
  // Now, this function simply wraps the saved HTML from our editor
  return `<div id="iframe_tj">
            <div id="scroll_tj" onMouseOver="(scrollStarted?pauseDiv():null)" onMouseOut="(scrollStarted?resumeDiv():null)">
              <div class="isi" id="isi">${ isiContent.html }</div>
            </div>
          </div>`;
}

function getIsiPreviewHTML(bannerWidth = 300)
{
  return getIsiHTML(bannerWidth).replace('<div id="iframe_tj">', '').slice(0, -6);
}

function getIsiScrollScript()
{
  return `<script>var ScrollRate=125,divName="scroll_tj",scrollStarted=!1;function scrollDiv_init(){DivElmnt=document.getElementById(divName),ReachedMaxScroll=!1,DivElmnt.scrollTop=0,PreviousScrollTop=0;var e=0;try{e=tl.totalDuration()}catch(t){}setTimeout(startScroll,1e3*e)}function startScroll(){scrollStarted=!0,ScrollInterval=setInterval(scrollDiv,ScrollRate)}function scrollDiv(){ReachedMaxScroll||(DivElmnt.scrollTop=PreviousScrollTop,PreviousScrollTop++,ReachedMaxScroll=DivElmnt.scrollHeight-DivElmnt.offsetHeight<=DivElmnt.scrollTop)}function pauseDiv(){clearInterval(ScrollInterval)}function resumeDiv(){PreviousScrollTop=DivElmnt.scrollTop,ScrollInterval=setInterval(scrollDiv,ScrollRate)}window.addEventListener("load",scrollDiv_init);</script>`;
}