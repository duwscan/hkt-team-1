# Chrome Recorder Script Runner

A powerful tool for executing Chrome Recorder scripts with Puppeteer, featuring comprehensive logging, screenshot capture, and performance monitoring.

## Features

- 🚀 **Execute Chrome Recorder scripts** with full automation
- 📸 **Automatic screenshots** (initial, final, and step-by-step)
- 📝 **Comprehensive logging** to both human-readable and JSON formats
- 📊 **Performance monitoring** with detailed metrics
- 🌐 **Cross-platform Chrome support** with bundled Chromium
- 🔧 **Flexible browser options** for debugging and development

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```bash
node runner.js -s <script-path> -u <url>
```

### Complete Command Options

```bash
node runner.js \
  -s <script-path> \                    # Path to Chrome Recorder JavaScript file
  -u <url> \                            # Target URL to test
  -o <output-dir> \                     # Output directory (default: ./output)
  --headless \                           # Run in headless mode
  --timeout <ms> \                      # Navigation timeout (default: 30000)
  --step-screenshots \                   # Take screenshots after each step
  --log-file \                          # Save detailed logs to file
  --slow-mo <ms> \                      # Slow down operations for debugging
  --devtools \                          # Open DevTools automatically
  --window-size <width>x<height>        # Browser window size
```

## Browser Display Options

### Default Behavior (Visible Browser)
By default, the browser runs in **visible mode** so you can see what's happening:

```bash
# Browser will open and display on screen
node runner.js -s example.js -u "https://example.com"
```

### Headless Mode (Hidden Browser)
Run the browser in the background:

```bash
# Browser runs hidden (faster execution)
node runner.js -s example.js -u "https://example.com" --headless
```

### Debugging Options

#### Slow Motion Mode
Slow down operations to see what's happening:

```bash
# Add 1 second delay between actions
node runner.js -s example.js -u "https://example.com" --slow-mo 1000
```

#### DevTools Integration
Automatically open browser developer tools:

```bash
# Open DevTools for debugging
node runner.js -s example.js -u "https://example.com" --devtools
```

#### Custom Window Size
Set specific browser window dimensions:

```bash
# Mobile viewport simulation
node runner.js -s example.js -u "https://example.com" --window-size 375x667

# Large desktop viewport
node runner.js -s example.js -u "https://example.com" --window-size 2560x1440
```

## Examples

### Basic Script Execution
```bash
node runner.js -s examples/form-interaction-script.js -u "https://example.com/contact"
```

### Development with Debugging
```bash
node runner.js \
  -s examples/sample-recorder-script.js \
  -u "https://example.com" \
  --slow-mo 500 \
  --devtools \
  --window-size 1920x1080
```

### Production Run (Headless)
```bash
node runner.js \
  -s examples/production-script.js \
  -u "https://example.com" \
  --headless \
  -o ./production-output
```

## Output Files

### Screenshots
- `initial_<timestamp>.png` - Page before script execution
- `final_<timestamp>.png` - Page after script execution
- `step-<n>_<timestamp>.png` - Screenshots after each step (if enabled)

### Logs
- `example_execution_<timestamp>.log` - Human-readable execution log
- `example_data_<timestamp>.json` - Machine-readable JSON data

### Log Content
- **Execution Summary**: Script details, timing, step counts
- **Performance Metrics**: Browser performance, load times, memory usage
- **Console Logs**: All browser console messages with timestamps
- **Step Details**: Complete step-by-step execution information
- **Error Tracking**: Any errors that occurred during execution

## Configuration

### Environment Variables
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` - Skip Chromium download if using system Chrome

### Browser Arguments
The runner automatically includes these Chrome flags for stability:
- `--no-sandbox` - Disable sandbox for compatibility
- `--disable-setuid-sandbox` - Additional sandbox disable
- `--start-maximized` - Start with maximized window
- `--disable-web-security` - Disable web security for testing
- `--disable-features=VizDisplayCompositor` - Improve performance

## Troubleshooting

### Common Issues

#### Chrome Not Found
The runner automatically uses bundled Chromium. If you prefer system Chrome:
```bash
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
```

#### Navigation Timeouts
Increase timeout for slow-loading pages:
```bash
node runner.js -s script.js -u "https://example.com" --timeout 60000
```

#### Screenshot Errors
Ensure output directory is writable:
```bash
mkdir -p ./output
node runner.js -s script.js -u "https://example.com" -o ./output
```

## Development

### Project Structure
```
scripts/
├── runner.js                 # Main execution script
├── utils/
│   ├── screenshot.js         # Screenshot utilities
│   ├── console-logger.js     # Console logging
│   ├── performance.js        # Performance monitoring
│   └── replay-extension.js   # Chrome Recorder extension
├── examples/                 # Sample scripts
└── output/                   # Generated files
```

### Adding New Features
1. Modify `runner.js` for new command-line options
2. Update utility functions in `utils/` directory
3. Test with sample scripts in `examples/` directory

## License

MIT License - see LICENSE file for details.