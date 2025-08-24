const { ipcRenderer } = require('electron')

// DOM elements
const apiUrlInput = document.getElementById('apiUrl')
const apiKeyInput = document.getElementById('apiKey')
const validateApiKeyBtn = document.getElementById('validateApiKey')
const apiKeyStatus = document.getElementById('apiKeyStatus')
const testExecution = document.getElementById('testExecution')
const projectSelect = document.getElementById('projectSelect')
const screenSelect = document.getElementById('screenSelect')
const scriptSelect = document.getElementById('scriptSelect')
const selectFileBtn = document.getElementById('selectFile')
const scriptFilePath = document.getElementById('scriptFilePath')
const scriptContent = document.getElementById('scriptContent')
const runTestBtn = document.getElementById('runTest')
const runAllTestsBtn = document.getElementById('runAllTests')
const closeBrowserBtn = document.getElementById('closeBrowser')
const testResults = document.getElementById('testResults')
const resultsContent = document.getElementById('resultsContent')
const statusMessages = document.getElementById('statusMessages')

// State
let currentApiKey = ''
let currentApiUrl = ''
let projects = []
let screens = []
let testScripts = []
let selectedScriptContent = ''

// Event listeners
validateApiKeyBtn.addEventListener('click', validateApiKey)
projectSelect.addEventListener('change', onProjectChange)
screenSelect.addEventListener('change', onScreenChange)
scriptSelect.addEventListener('change', onScriptChange)
selectFileBtn.addEventListener('click', selectFile)
runTestBtn.addEventListener('click', runTest)
runAllTestsBtn.addEventListener('click', runAllTests)
closeBrowserBtn.addEventListener('click', closeBrowser)

// Initialize
function init() {
    // Load saved settings
    const savedApiUrl = localStorage.getItem('chrome_recorder_api_url')
    const savedApiKey = localStorage.getItem('chrome_recorder_api_key')
    
    if (savedApiUrl) {
        apiUrlInput.value = savedApiUrl
        currentApiUrl = savedApiUrl
    }
    
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey
        currentApiKey = savedApiKey
        validateApiKey()
    }
}

// API Key validation
async function validateApiKey() {
    const apiKey = apiKeyInput.value.trim()
    const apiUrl = apiUrlInput.value.trim()
    
    if (!apiKey || !apiUrl) {
        showStatus('Please enter both API key and URL', 'error')
        return
    }
    
    validateApiKeyBtn.disabled = true
    validateApiKeyBtn.textContent = 'Validating...'
    
    try {
        const result = await ipcRenderer.invoke('validate-api-key', { apiKey, apiUrl })
        
        if (result.success) {
            currentApiKey = apiKey
            currentApiUrl = apiUrl
            
            // Save settings
            localStorage.setItem('chrome_recorder_api_url', apiUrl)
            localStorage.setItem('chrome_recorder_api_key', apiKey)
            
            // Update UI
            apiKeyStatus.textContent = `✅ Connected as ${result.data.name}`
            apiKeyStatus.className = 'text-sm text-green-600'
            testExecution.style.display = 'block'
            
            // Load projects
            await loadProjects()
            
            showStatus('API key validated successfully!', 'success')
        } else {
            throw new Error(result.error)
        }
    } catch (error) {
        apiKeyStatus.textContent = '❌ Invalid API key'
        apiKeyStatus.className = 'text-sm text-red-600'
        testExecution.style.display = 'none'
        showStatus(`Validation failed: ${error.message}`, 'error')
    } finally {
        validateApiKeyBtn.disabled = false
        validateApiKeyBtn.textContent = 'Validate'
    }
}

// Load projects
async function loadProjects() {
    try {
        const result = await ipcRenderer.invoke('get-projects', { 
            apiKey: currentApiKey, 
            apiUrl: currentApiUrl 
        })
        
        if (result.success) {
            projects = result.data
            populateProjectSelect()
        } else {
            throw new Error(result.error)
        }
    } catch (error) {
        showStatus(`Failed to load projects: ${error.message}`, 'error')
    }
}

// Populate project select
function populateProjectSelect() {
    projectSelect.innerHTML = '<option value="">Select a project</option>'
    projects.forEach(project => {
        const option = document.createElement('option')
        option.value = project.id
        option.textContent = project.name
        projectSelect.appendChild(option)
    })
}

// Project change handler
async function onProjectChange() {
    const projectId = projectSelect.value
    screenSelect.innerHTML = '<option value="">Select a screen</option>'
    scriptSelect.innerHTML = '<option value="">Select a test script</option>'
    screenSelect.disabled = !projectId
    scriptSelect.disabled = true
    
    if (projectId) {
        await loadScreens(projectId)
    }
}

// Load screens
async function loadScreens(projectId) {
    try {
        const result = await ipcRenderer.invoke('get-screens', { 
            apiKey: currentApiKey, 
            apiUrl: currentApiUrl, 
            projectId 
        })
        
        if (result.success) {
            screens = result.data.filter(screen => screen.project_id == projectId)
            populateScreenSelect()
        } else {
            throw new Error(result.error)
        }
    } catch (error) {
        showStatus(`Failed to load screens: ${error.message}`, 'error')
    }
}

// Populate screen select
function populateScreenSelect() {
    screenSelect.innerHTML = '<option value="">Select a screen</option>'
    screens.forEach(screen => {
        const option = document.createElement('option')
        option.value = screen.id
        option.textContent = screen.name
        screenSelect.appendChild(option)
    })
    screenSelect.disabled = false
}

// Screen change handler
async function onScreenChange() {
    const screenId = screenSelect.value
    scriptSelect.innerHTML = '<option value="">Select a test script</option>'
    scriptSelect.disabled = !screenId
    
    if (screenId) {
        await loadTestScripts(screenId)
    }
}

// Load test scripts
async function loadTestScripts(screenId) {
    try {
        const projectId = projectSelect.value
        const result = await ipcRenderer.invoke('get-test-scripts', { 
            apiKey: currentApiKey, 
            apiUrl: currentApiUrl, 
            projectId, 
            screenId 
        })
        
        if (result.success) {
            testScripts = result.data.filter(script => 
                script.screen_id == screenId && script.project_id == projectId
            )
            populateScriptSelect()
        } else {
            throw new Error(result.error)
        }
    } catch (error) {
        showStatus(`Failed to load test scripts: ${error.message}`, 'error')
    }
}

// Populate script select
function populateScriptSelect() {
    scriptSelect.innerHTML = '<option value="">Select a test script</option>'
    testScripts.forEach(script => {
        const option = document.createElement('option')
        option.value = script.id
        option.textContent = `${script.name} (v${script.version})`
        option.dataset.content = script.script_content
        scriptSelect.appendChild(option)
    })
    scriptSelect.disabled = false
}

// Script change handler
function onScriptChange() {
    const scriptId = scriptSelect.value
    if (scriptId) {
        const script = testScripts.find(s => s.id == scriptId)
        if (script) {
            selectedScriptContent = script.script_content
            scriptContent.value = script.script_content
            runTestBtn.disabled = false
            runAllTestsBtn.disabled = false
        }
    } else {
        selectedScriptContent = ''
        scriptContent.value = ''
        runTestBtn.disabled = true
        runAllTestsBtn.disabled = true
    }
}

// File selection
async function selectFile() {
    try {
        const filePath = await ipcRenderer.invoke('select-file')
        if (filePath) {
            scriptFilePath.value = filePath
            
            // Read file content
            const fs = require('fs')
            const content = fs.readFileSync(filePath, 'utf8')
            scriptContent.value = content
            selectedScriptContent = content
            
            runTestBtn.disabled = false
            runAllTestsBtn.disabled = false
            
            showStatus('Script file loaded successfully!', 'success')
        }
    } catch (error) {
        showStatus(`Failed to load file: ${error.message}`, 'error')
    }
}

// Run test
async function runTest() {
    if (!selectedScriptContent) {
        showStatus('No script content to run', 'error')
        return
    }
    
    runTestBtn.disabled = true
    runTestBtn.textContent = 'Running...'
    
    try {
        const result = await ipcRenderer.invoke('run-test-script', {
            scriptContent: selectedScriptContent,
            apiKey: currentApiKey,
            apiUrl: currentApiUrl
        })
        
        if (result.success) {
            showTestResults(result.data)
            showStatus('Test completed successfully!', 'success')
        } else {
            throw new Error(result.error)
        }
    } catch (error) {
        showStatus(`Test failed: ${error.message}`, 'error')
    } finally {
        runTestBtn.disabled = false
        runTestBtn.textContent = 'Run Test'
    }
}

// Run all tests
async function runAllTests() {
    if (testScripts.length === 0) {
        showStatus('No test scripts available', 'error')
        return
    }
    
    runAllTestsBtn.disabled = true
    runAllTestsBtn.textContent = 'Running All...'
    
    const results = []
    
    try {
        for (const script of testScripts) {
            showStatus(`Running test: ${script.name}`, 'info')
            
            const result = await ipcRenderer.invoke('run-test-script', {
                scriptContent: script.script_content,
                apiKey: currentApiKey,
                apiUrl: currentApiUrl
            })
            
            if (result.success) {
                results.push({
                    script: script,
                    result: result.data
                })
            } else {
                results.push({
                    script: script,
                    result: { error: result.error }
                })
            }
        }
        
        showAllTestResults(results)
        showStatus(`All tests completed! ${results.length} tests run.`, 'success')
    } catch (error) {
        showStatus(`Failed to run all tests: ${error.message}`, 'error')
    } finally {
        runAllTestsBtn.disabled = false
        runAllTestsBtn.textContent = 'Run All Tests'
    }
}

// Close browser
async function closeBrowser() {
    try {
        await ipcRenderer.invoke('close-browser')
        showStatus('Browser closed successfully!', 'success')
    } catch (error) {
        showStatus(`Failed to close browser: ${error.message}`, 'error')
    }
}

// Show test results
function showTestResults(result) {
    testResults.style.display = 'block'
    
    const resultHtml = `
        <div class="border border-gray-200 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 mb-2">Test Result</h3>
            <div class="space-y-2 text-sm">
                <p><strong>Status:</strong> <span class="px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">${result.status}</span></p>
                <p><strong>Current URL:</strong> ${result.current_url || 'N/A'}</p>
                <p><strong>Console Logs:</strong> ${result.console_logs?.length || 0} entries</p>
                <p><strong>Screenshots:</strong> ${result.screenshots?.length || 0} captured</p>
                ${result.error_message ? `<p><strong>Error:</strong> <span class="text-red-600">${result.error_message}</span></p>` : ''}
            </div>
        </div>
    `
    
    resultsContent.innerHTML = resultHtml
}

// Show all test results
function showAllTestResults(results) {
    testResults.style.display = 'block'
    
    let resultHtml = '<div class="space-y-4">'
    results.forEach((item, index) => {
        const result = item.result
        const script = item.script
        
        resultHtml += `
            <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="font-medium text-gray-900 mb-2">${script.name} (v${script.version})</h3>
                <div class="space-y-2 text-sm">
                    <p><strong>Status:</strong> <span class="px-2 py-1 rounded-full text-xs font-medium ${
                        result.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }">${result.error ? 'Failed' : 'Completed'}</span></p>
                    ${result.error ? 
                        `<p><strong>Error:</strong> <span class="text-red-600">${result.error}</span></p>` :
                        `<p><strong>Current URL:</strong> ${result.current_url || 'N/A'}</p>
                         <p><strong>Console Logs:</strong> ${result.console_logs?.length || 0} entries</p>
                         <p><strong>Screenshots:</strong> ${result.screenshots?.length || 0} captured</p>`
                    }
                </div>
            </div>
        `
    })
    resultHtml += '</div>'
    
    resultsContent.innerHTML = resultHtml
}

// Show status message
function showStatus(message, type = 'info') {
    const statusDiv = document.createElement('div')
    statusDiv.className = `px-4 py-2 rounded-md text-white text-sm ${
        type === 'success' ? 'bg-green-600' :
        type === 'error' ? 'bg-red-600' :
        type === 'warning' ? 'bg-yellow-600' :
        'bg-blue-600'
    }`
    statusDiv.textContent = message
    
    statusMessages.appendChild(statusDiv)
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.parentNode.removeChild(statusDiv)
        }
    }, 5000)
}

// Initialize the app
init()