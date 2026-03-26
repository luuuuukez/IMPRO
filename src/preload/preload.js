const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openChat:        () => ipcRenderer.invoke('open-chat'),
  closeChat:       () => ipcRenderer.send('close-chat'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  moveWindow:      (x, y) => ipcRenderer.send('move-window', { x, y }),
  notifyFileDrop:  (name, filePath) => ipcRenderer.send('file-dropped', { name, path: filePath }),
  analyseFile:     (filePath, fileName) => ipcRenderer.invoke('analyse-file', { filePath, fileName }),
  showBubble:      (text) => ipcRenderer.send('show-bubble', text),
  hideBubble:      () => ipcRenderer.send('hide-bubble'),
  openReport:      () => ipcRenderer.send('open-report'),

  onFileDrop: (cb) => {
    const handler = (_, { name, path: filePath } = {}) => cb(name, filePath);
    ipcRenderer.on('file-dropped', handler);
    return () => ipcRenderer.removeListener('file-dropped', handler);
  },
  onAutoAnalyse: (cb) => {
    const handler = (_, { name, filePath }) => cb(name, filePath);
    ipcRenderer.on('auto-analyse-file', handler);
    return () => ipcRenderer.removeListener('auto-analyse-file', handler);
  },
  onBubbleText: (cb) => {
    const handler = (_, text) => cb(text);
    ipcRenderer.on('set-bubble-text', handler);
    return () => ipcRenderer.removeListener('set-bubble-text', handler);
  },
});
