# Chrome Recorder Scripts Automation

A comprehensive system for executing Chrome Recorder test scenarios with automated data collection and reporting. This implementation provides a production-ready framework for running exported Chrome Recorder JavaScript files with full integration of screenshot capture, console monitoring, and performance measurement.

## 🚀 Features

### Chrome Recorder Script Execution
- **Native @puppeteer/replay Support**: Full compatibility with Chrome Recorder exports
- **Step-by-Step Execution**: Detailed tracking of each script step with comprehensive logging
- **Error Handling**: Robust timeout management and error recovery mechanisms
- **Multiple Format Support**: Handles both standard Chrome Recorder exports and custom scripts

### 📸 Comprehensive Data Collection
- **Full-page Screenshots**: Automatic capture before, during, and after script execution
- **Step Screenshots**: Optional screenshots after each individual step
- **Console Monitoring**: Real-time capture of all console logs, warnings, and errors
- **Performance Metrics**: Web Vitals, load timing, memory usage, and resource analysis
- **URL Tracking**: Monitors navigation changes throughout script execution

### 🛠 Production-Ready Architecture
```
scripts/
├── runner.js              # Main Puppeteer executor with @puppeteer/replay
├── demo-runner.js         # Demo version (no browser dependencies)
├── example.js             # Real Chrome Recorder script example
├── utils/
│   ├── screenshot.js      # Screenshot capture utilities
│   ├── console-logger.js  # Console output monitoring
│   ├── performance.js     # Performance metrics collection
│   └── replay-extension.js # Custom Puppeteer Replay extension
└── examples/              # Sample Chrome Recorder scripts
```

## 📋 Vietnamese Requirements Compliance

✅ **Nhận đường dẫn của 1 file js**: Command-line argument `-s <script-path>`  
✅ **Nhận URL màn hình**: Command-line argument `-u <url>`  
✅ **Truy cập vào màn hình URL**: Browser navigation with wait strategies  
✅ **Load instance của Chrome**: Cross-platform Puppeteer with bundled Chromium  
✅ **Chạy lại kịch bản Chrome Recorder**: Full @puppeteer/replay integration  
✅ **Đo thời gian tải**: Performance timing and Web Vitals collection  
✅ **Kiểm tra lỗi console**: Real-time console error monitoring  
✅ **Chụp toàn màn hình**: Full-page screenshot capture with timestamps  
✅ **Output tên màn hình và đường dẫn file**: Structured result output  
✅ **Output console.log**: Complete console log capture and categorization  

## 🔧 Installation

```bash
# Install dependencies (includes bundled Chromium for cross-platform compatibility)
npm install
```

**Cross-Platform Support**: The system now uses the standard `puppeteer` package with bundled Chromium, eliminating the need to install Chrome manually or configure executable paths. This works out of the box on Windows, macOS, and Linux.

## 📚 Usage Examples

### Basic Chrome Recorder Script Execution
```bash
# Execute the provided example Chrome Recorder script
node runner.js -s ./example.js -u https://yopaz.vn/recruit/#

# Custom output directory and timeout
node runner.js -s ./example.js -u https://yopaz.vn/recruit/# -o ./my-screenshots --timeout 60000

# Disable step screenshots for faster execution
node runner.js -s ./example.js -u https://yopaz.vn/recruit/# --step-screenshots false
```

### Demo Mode (No Browser Required)
```bash
# Test without browser automation
npm run demo

# Or directly
node demo-runner.js -s ./example.js -u https://example.com
```

### Creating Chrome Recorder Scripts

1. **Open Chrome DevTools** (F12)
2. **Go to Recorder tab**
3. **Start recording** your test scenario
4. **Perform actions** on the website
5. **Stop recording** and export as "Puppeteer (Chrome Recorder format)"
6. **Save the exported .js file** and use it with this runner

## 📊 Output Format

The system generates comprehensive JSON output:

```json
{
  "screenName": "recruit",
  "url": "https://yopaz.vn/recruit/#",
  "currentUrl": "https://yopaz.vn/about-us/",
  "scriptPath": "/path/to/example.js",
  "screenshots": {
    "initial": "./output/initial_2024-01-15T10-30-00-000Z.png",
    "final": "./output/final_2024-01-15T10-31-30-000Z.png",
    "steps": [
      {
        "step": 1,
        "type": "navigate",
        "path": "./output/step-1-navigate_2024-01-15T10-30-15-000Z.png",
        "timestamp": "2024-01-15T10:30:15.000Z"
      }
    ]
  },
  "performance": {
    "totalExecutionTime": "90234.56ms",
    "scriptSteps": {
      "totalSteps": 15,
      "totalScreenshots": 17,
      "totalErrors": 0
    },
    "metrics": {
      "pageLoadTime": "1250ms",
      "jsHeapUsedSize": "15.23 MB"
    }
  },
  "console": {
    "logs": [
      {
        "type": "log",
        "text": "Page navigation completed",
        "timestamp": "2024-01-15T10:30:15.000Z"
      }
    ],
    "errorCount": 0,
    "warningCount": 2
  },
  "execution": {
    "steps": [
      {
        "stepNumber": 1,
        "type": "navigate",
        "timestamp": "2024-01-15T10:30:15.000Z",
        "url": "https://yopaz.vn/recruit/#",
        "completed": true
      }
    ],
    "errors": [],
    "summary": {
      "totalSteps": 15,
      "totalExecutionTimeMs": 90234
    }
  }
}
```

## 🔧 Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --script` | Path to Chrome Recorder JavaScript file | Required |
| `-u, --url` | URL to test | Required |
| `-o, --output` | Output directory for screenshots | `./output` |
| `--headless` | Run in headless mode | `true` |
| `--timeout` | Timeout in milliseconds | `30000` |
| `--step-screenshots` | Take screenshots after each step | `true` |

## 🐛 Troubleshooting

### Chrome Not Found
```bash
# Set custom Chrome path
export CHROME_EXECUTABLE_PATH=/path/to/chrome
node runner.js -s ./script.js -u https://example.com
```

### Script Import Errors
- Ensure the script file uses proper ES6 module format
- Check that the script exports a `run` function
- Verify the script is a valid Chrome Recorder export

### Performance Issues
- Disable step screenshots: `--step-screenshots false`
- Use headless mode: `--headless true`
- Increase timeout for complex pages: `--timeout 60000`

## 🔗 Integration Examples

### Laravel Backend Integration
```php
// Execute Chrome Recorder script from Laravel
$command = "node " . base_path('scripts/runner.js') . 
           " -s " . escapeshellarg($scriptPath) . 
           " -u " . escapeshellarg($url) . 
           " -o " . escapeshellarg($outputDir);

$result = shell_exec($command);
$data = json_decode($result, true);

// Store results in database
TestResult::create([
    'script_path' => $data['scriptPath'],
    'url' => $data['url'],
    'screenshots' => $data['screenshots'],
    'performance' => $data['performance'],
    'console_logs' => $data['console']['logs'],
    'execution_time' => $data['performance']['totalExecutionTime']
]);
```

### Electron App Integration
```javascript
// Execute from Electron main process
const { exec } = require('child_process');
const path = require('path');

function runChromeRecorderScript(scriptPath, url) {
  return new Promise((resolve, reject) => {
    const command = `node ${path.join(__dirname, 'scripts/runner.js')} -s "${scriptPath}" -u "${url}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}
```

## 📝 Example Chrome Recorder Script

The included `example.js` demonstrates a real Chrome Recorder export that:
- Navigates to a recruitment website
- Performs pagination clicks
- Searches for job positions
- Fills out application forms
- Navigates between different pages

This script can be used as a reference for creating your own test scenarios.

## 🚀 Development

```bash
# Run tests
npm test

# Run demo
npm run demo

# Execute example script
npm run example
```

This implementation is ready for integration with the larger Chrome Recorder test management system described in SPEC.md and provides a solid foundation for automated regression testing workflows.