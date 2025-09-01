/* -----------------------------
   ISI Editor for Custom Content using Quill.js
------------------------------ */

// Store the ISI content as a single HTML string
let isiContent = {
  html: `<h1>INDICATION and IMPORTANT SAFETY INFORMATION</h1><ul><li><p>KERENDIA (finerenone) is indicated to reduce the risk of cardiovascular death.</p></li></ul><p><br></p><h1>IMPORTANT SAFETY INFORMATION</h1><ul><li><p><strong class="bold-italic">Hyperkalemia:</strong> KERENDIA can cause hyperkalemia.</p></li></ul>`
};

let quillEditorInstance = null; // To hold the editor object

function createISIEditor() {
  const editorContainer = document.createElement('div');
  editorContainer.id = 'isiEditor';
  editorContainer.style.display = 'none';
  
  editorContainer.innerHTML = `
    <div class="isi-editor-modal">
      <div class="isi-editor-header">
        <h3>ISI Content Editor</h3>
        <button id="closeIsiEditorBtn" class="icon-btn">&times;</button>
      </div>
      
      <div id="isi-toolbar">
        <select class="ql-header" defaultValue="0"><option value="1">Header 1</option><option value="2">Header 2</option><option value="0">Normal</option></select>
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <select class="ql-color"></select>
        <button class="ql-link"></button>
        <button class="ql-image"></button>
        <button class="ql-list" value="ordered"></button>
        <button class="ql-list" value="bullet"></button>
        <button class="ql-clean"></button>
      </div>
      <div id="quill-editor-area"></div>
      
      <div class="isi-editor-footer">
        <button id="clearISI" class="secondary-btn">Clear Content</button>
        <button id="cancelISI" class="secondary-btn">Cancel</button>
        <button id="saveISI">Save Changes</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #isiEditor { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .isi-editor-modal { background: var(--bg-secondary); width: 800px; max-width: 90%; height: 600px; max-height: 90vh; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); display: flex; flex-direction: column; }
    .isi-editor-header, .isi-editor-footer { padding: 16px; border-bottom: 1px solid var(--border-primary); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .isi-editor-footer { border-bottom: none; border-top: 1px solid var(--border-primary); }
    #quill-editor-area { height: 100%; overflow-y: auto; flex-grow: 1; }
    #isi-toolbar { padding: 8px; border-bottom: 1px solid var(--border-primary); }
    .secondary-btn { background-color: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-primary); }
    .secondary-btn:hover { background-color: var(--border-primary); }
    .ql-snow { color: var(--text-primary); }
    .ql-snow .ql-stroke { stroke: var(--text-primary); }
    .ql-snow .ql-fill { fill: var(--text-primary); }
    .ql-snow .ql-picker-label { color: var(--text-primary); }
    .ql-toolbar { border-color: var(--border-primary) !important; }
    .ql-container { border-color: var(--border-primary) !important; }
    .ql-editor { font-size: 14px; }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(editorContainer);

  quillEditorInstance = new Quill('#quill-editor-area', {
    modules: {
      toolbar: '#isi-toolbar'
    },
    theme: 'snow'
  });

  editorContainer.querySelector('#closeIsiEditorBtn').addEventListener('click', () => editorContainer.style.display = 'none');
  editorContainer.querySelector('#cancelISI').addEventListener('click', () => editorContainer.style.display = 'none');
  editorContainer.querySelector('#clearISI').addEventListener('click', () => quillEditorInstance.setText('') );

  editorContainer.querySelector('#saveISI').addEventListener('click', () => {
    isiContent.html = quillEditorInstance.root.innerHTML;
    editorContainer.style.display = 'none';
    updatePreviewAndCode();
  });

  return editorContainer;
}

function showISIEditor() {
  let editor = document.getElementById('isiEditor');
  if (!editor) {
      editor = createISIEditor();
  }
  
  // Load the saved content into the editor before showing it
  if (quillEditorInstance) {
    quillEditorInstance.root.innerHTML = isiContent.html;
  }

  editor.style.display = 'flex';
}