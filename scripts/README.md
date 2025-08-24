# Chrome Recorder Scripts

This folder contains JavaScript scripts for executing Chrome Recorder test scenarios using Puppeteer or Playwright.

## Features

- ✅ Execute Chrome Recorder exported scripts
- 📸 Take full-page screenshots (initial and final)
- 📝 Capture console logs and errors
- ⏱️ Measure performance metrics
- 🌐 Track URL changes
- 📊 Generate detailed execution reports

## Installation

```bash
cd scripts
npm install
```

## Usage

### Basic Usage

```bash
node runner.js -s <script-path> -u <url>
```

### Parameters

- `-s, --script <path>` - Path to the Chrome Recorder JavaScript file (required)
- `-u, --url <url>` - URL of the screen to test (required)
- `-o, --output <path>` - Output directory for screenshots (default: ./output)
- `--headless` - Run in headless mode (default: true)
- `--timeout <ms>` - Timeout in milliseconds (default: 30000)

### Examples

```bash
# Run with a sample script
node runner.js -s ./examples/sample-recorder-script.js -u https://example.com

# Run with custom output directory
node runner.js -s ./examples/form-interaction-script.js -u https://httpbin.org/forms/post -o ./my-screenshots

# Run in non-headless mode (visible browser)
node runner.js -s ./examples/sample-recorder-script.js -u https://google.com --headless false

# Run with custom timeout
node runner.js -s ./my-script.js -u https://slow-website.com --timeout 60000
```

## Output

The script provides comprehensive output including:

- **Screen Name**: Derived from the URL
- **Current URL**: Final URL after script execution
- **Screenshots**: Paths to initial and final screenshots
- **Performance Metrics**: Load times, memory usage, render metrics
- **Console Logs**: All console output categorized by type (log, warning, error)
- **Execution Time**: Total time taken to run the script

## Chrome Recorder Script Format

Chrome Recorder scripts should export a default function that accepts `{ page, browser }` parameters:

```javascript
export default async function run({ page, browser }) {
  // Your Chrome Recorder actions here
  await page.click('#button');
  await page.type('#input', 'text');
  // ... more actions
}
```

## Example Scripts

- `examples/sample-recorder-script.js` - Basic interaction example
- `examples/form-interaction-script.js` - Form testing example

## Utilities

### Screenshot Utility (`utils/screenshot.js`)
- Take full-page screenshots
- Take element-specific screenshots
- Automatic timestamp naming

### Console Logger (`utils/console-logger.js`)
- Capture all console output
- Track page errors and HTTP errors
- Categorize by type (log, warning, error)

### Performance Monitor (`utils/performance.js`)
- Measure page load metrics
- Capture Web Vitals
- Monitor resource loading

## Integration

This script runner can be integrated with:
- Laravel backend APIs (for storing results)
- Electron desktop applications
- CI/CD pipelines
- Test automation frameworks

## Requirements

- Node.js 18+
- Chrome/Chromium browser
- Network access for target URLs

## Troubleshooting

### Common Issues

1. **Script file not found**: Ensure the script path is correct and accessible
2. **Permission errors**: Make sure the output directory is writable
3. **Timeout errors**: Increase timeout for slow-loading pages
4. **Memory issues**: Run in headless mode for better performance

### Debug Mode

Run with environment variable for detailed debugging:

```bash
DEBUG=* node runner.js -s script.js -u https://example.com
```