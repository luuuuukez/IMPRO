const { ipcRenderer, contextBridge } = require('electron');

const data = ipcRenderer.sendSync('get-analysis-data');
console.log('[preload-report] received:', data ? 'data present' : 'null');

// contextIsolation: true means window.IMPRO_DATA = data won't be visible
// to the page. Use contextBridge to expose it into the main world instead.
contextBridge.exposeInMainWorld('IMPRO_DATA', data);
