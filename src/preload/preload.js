const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openChat:        () => ipcRenderer.invoke('open-chat'),
  closeChat:       () => ipcRenderer.send('close-chat'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  moveWindow:      (x, y) => ipcRenderer.send('move-window', { x, y }),
  notifyFileDrop:  () => ipcRenderer.send('file-dropped'),
  showBubble:      (text) => ipcRenderer.send('show-bubble', text),
  hideBubble:      () => ipcRenderer.send('hide-bubble'),

  onFileDrop: (cb) => {
    ipcRenderer.on('file-dropped', cb);
    return () => ipcRenderer.removeListener('file-dropped', cb);
  },
  onBubbleText: (cb) => {
    const handler = (_, text) => cb(text);
    ipcRenderer.on('set-bubble-text', handler);
    return () => ipcRenderer.removeListener('set-bubble-text', handler);
  },
});
