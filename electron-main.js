const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        fullscreen: true, // Iniciar en pantalla completa
        autoHideMenuBar: true,
        resizable: true,
        fullscreenable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.setFullScreen(true);

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
