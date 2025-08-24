const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Chrome Recorder Test Manager'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for renderer process communication
ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

// Puppeteer IPC handlers
ipcMain.handle('puppeteer-execute-script', async (event, scriptData) => {
  try {
    // This will be implemented to handle Puppeteer operations
    // For now, return a mock response
    console.log('🎬 Puppeteer script execution requested:', scriptData.scriptName);
    
    return {
      success: true,
      message: 'Script execution completed (mock mode)',
      data: {
        scriptId: scriptData.scriptId,
        executionTime: '2000ms',
        status: 'success'
      }
    };
  } catch (error) {
    console.error('❌ Puppeteer execution failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('puppeteer-take-screenshot', async (event, options) => {
  try {
    // This will be implemented to handle screenshot capture
    console.log('📸 Screenshot requested:', options);
    
    return {
      success: true,
      filePath: `./screenshots/screenshot_${Date.now()}.png`,
      message: 'Screenshot captured (mock mode)'
    };
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('puppeteer-get-performance', async (event) => {
  try {
    // This will be implemented to handle performance metrics
    console.log('📊 Performance metrics requested');
    
    return {
      success: true,
      metrics: {
        timestamp: Date.now(),
        pageLoad: 200,
        domContentLoaded: 100,
        jsHeapUsed: '2.5 MB',
        jsHeapTotal: '5.0 MB'
      }
    };
  } catch (error) {
    console.error('❌ Performance metrics failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
});