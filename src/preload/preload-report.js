const { ipcRenderer } = require('electron');

// Runs before page scripts — inject analysis data synchronously so
// reportData.ts can read window.IMPRO_DATA at module evaluation time.
const data = ipcRenderer.sendSync('get-analysis-data');
if (data) {
  window.IMPRO_DATA = data;
}
