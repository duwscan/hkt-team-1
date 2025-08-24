const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const puppeteer = require('puppeteer')
const axios = require('axios')

let mainWindow
let browser

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'Chrome Recorder Test Manager'
  })

  mainWindow.loadFile('index.html')

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for test execution
ipcMain.handle('run-test-script', async (event, { scriptContent, apiKey, apiUrl }) => {
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
      })
    }

    const page = await browser.newPage()
    
    // Set up console log collection
    const consoleLogs = []
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      })
    })

    // Set up error collection
    const errors = []
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    })

    // Execute the test script
    await page.evaluateOnNewDocument(scriptContent)
    
    // Take screenshot
    const screenshot = await page.screenshot({ 
      fullPage: true,
      encoding: 'base64'
    })

    // Collect current URL
    const currentUrl = page.url()

    // Close the page
    await page.close()

    // Send results to API
    const testResult = {
      status: 'completed',
      console_logs: consoleLogs,
      screenshots: [screenshot],
      current_url: currentUrl,
      error_message: errors.length > 0 ? errors[0].message : null
    }

    // Here you would send the results to your API
    // For now, we'll just return the results
    return {
      success: true,
      data: testResult
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
})

ipcMain.handle('close-browser', async () => {
  if (browser) {
    await browser.close()
    browser = null
  }
})

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JavaScript Files', extensions: ['js'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('validate-api-key', async (event, { apiKey, apiUrl }) => {
  try {
    const response = await axios.get(`${apiUrl}/api/auth/api-key`, {
      headers: {
        'X-API-Key': apiKey
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to validate API key'
    }
  }
})

ipcMain.handle('get-projects', async (event, { apiKey, apiUrl }) => {
  try {
    const response = await axios.get(`${apiUrl}/api/projects`, {
      headers: {
        'X-API-Key': apiKey
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch projects'
    }
  }
})

ipcMain.handle('get-screens', async (event, { apiKey, apiUrl, projectId }) => {
  try {
    const response = await axios.get(`${apiUrl}/api/screens`, {
      headers: {
        'X-API-Key': apiKey
      },
      params: { project_id: projectId }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch screens'
    }
  }
})

ipcMain.handle('get-test-scripts', async (event, { apiKey, apiUrl, projectId, screenId }) => {
  try {
    const response = await axios.get(`${apiUrl}/api/test-scripts`, {
      headers: {
        'X-API-Key': apiKey
      },
      params: { 
        project_id: projectId,
        screen_id: screenId
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch test scripts'
    }
  }
})