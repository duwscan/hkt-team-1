# Chrome Recorder Desktop App

A desktop application built with React and Electron for managing and executing Chrome Recorder test scripts with real Puppeteer automation.

## Overview

This application is part of the Chrome Recorder Test Management System, providing a desktop interface for:

- **API Key Authentication**: Secure access using API keys
- **Project & Script Management**: Browse and select test scripts by project, screen, and tags
- **Real Puppeteer Execution**: Run Chrome Recorder scripts with actual browser automation
- **Data Collection**: Capture URLs, console logs, screenshots, and performance metrics during test execution
- **Results Management**: View execution results and submit data to backend API

## Features

### 🔐 Authentication
- API key-based authentication
- Persistent login session storage
- Secure connection to backend API

### 📊 Dashboard
- Project selection and filtering
- Screen-based script organization
- Tag-based filtering system
- Search functionality with script descriptions
- Batch script selection
- Script metadata display (target URLs, descriptions)

### ▶️ Test Execution
- **Real Puppeteer Integration**: Uses actual Chrome browser automation
- **Chrome Recorder Script Support**: Executes Chrome Recorder exported scripts
- Sequential script execution (no parallel processing)
- Real-time execution progress with step-by-step tracking
- Live logging and error reporting
- Automatic screenshot capture (initial, final, and step-by-step)
- Console error detection and logging
- Performance metrics collection
- Stop/start execution controls

### 📈 Results & Reporting
- Execution summary with success/failure counts
- Detailed logs with timestamps
- Screenshot gallery and management
- Performance metrics analysis
- Test result submission to backend API
- Visual execution progress indicators

## Technology Stack

- **Frontend**: React 18 with Material-UI components
- **Desktop Framework**: Electron
- **Browser Automation**: Puppeteer with @puppeteer/replay
- **Chrome Recorder**: Full support for Chrome Recorder exported scripts
- **API Communication**: Axios for HTTP requests
- **Build System**: Create React App + Electron Builder

## Architecture

```
src/
├── components/           # React UI components
│   ├── AuthScreen.js    # API key authentication
│   ├── Dashboard.js     # Main project/script management
│   ├── TestExecution.js # Test running interface
│   └── Header.js        # App navigation header
├── services/            # Business logic services
│   ├── apiService.js    # Backend API communication
│   ├── puppeteerRunner.js # Mock Puppeteer interface (browser mode)
│   └── testExecutionService.js # Test execution orchestration
├── config/              # Configuration files
│   └── api.js          # API endpoints and settings
└── App.js               # Main application component

public/
└── electron.js          # Electron main process with Puppeteer handlers
```

## Puppeteer Integration

### Architecture Overview
The app uses a **hybrid architecture** where:
- **React Frontend**: Handles UI and API communication
- **Electron Main Process**: Manages Puppeteer operations
- **IPC Communication**: Frontend and main process communicate via Electron IPC

### Browser vs Desktop Mode
- **Browser Mode**: Mock Puppeteer interface for development
- **Desktop Mode**: Full Puppeteer automation via Electron main process

### Chrome Recorder Script Support
The app fully supports Chrome Recorder exported scripts:
- **Script Format**: Detects and executes both `run()` function and default export formats
- **Step Tracking**: Monitors each step execution with detailed logging
- **Screenshot Capture**: Automatic screenshots at key points
- **Performance Monitoring**: Collects browser performance metrics
- **Error Handling**: Comprehensive error capture and reporting

### Browser Automation Features
- **Cross-platform Chrome**: Uses bundled Chromium for consistency
- **Real-time Monitoring**: Live console logging and error detection
- **Performance Metrics**: Page load times, memory usage, and more
- **Screenshot Management**: Organized screenshot storage and display
- **Resource Management**: Proper cleanup of browser resources

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager
- Chrome/Chromium browser (optional, uses bundled version)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Development mode:**
   ```bash
   npm run dev
   ```
   This starts both React dev server and Electron app.

3. **Build for production:**
   ```bash
   npm run build
   npm run electron-pack
   ```

### Configuration

- **API Endpoint**: Update `API_BASE_URL` in `src/services/apiService.js`
- **Electron Settings**: Modify `public/electron.js` for window preferences
- **Build Settings**: Configure `electron-builder` in `package.json`
- **Puppeteer Options**: Adjust browser settings in `src/services/puppeteerRunner.js`

## Usage

### 1. Authentication
- Launch the app
- Enter your API key to authenticate
- The key is stored locally for subsequent sessions

### 2. Project Management
- Select a project from the dropdown
- Filter by screen, tags, or search terms
- View script details including target URLs and descriptions
- Select individual scripts or use "Select All"

### 3. Test Execution
- Click "Run Selected" to start execution
- Watch real browser automation in action
- Monitor progress in real-time with step-by-step tracking
- View logs, screenshots, and results as tests complete
- Stop execution at any time if needed

### 4. Results & Analysis
- Review execution summary with success/failure counts
- Browse captured screenshots
- Analyze performance metrics
- View detailed logs for debugging
- Results are automatically submitted to backend API

## Chrome Recorder Scripts

### Supported Script Types
1. **Chrome Recorder Exports**: Scripts exported from Chrome DevTools Recorder
2. **Custom Puppeteer Scripts**: Scripts written specifically for Puppeteer
3. **Hybrid Scripts**: Scripts that combine both approaches

### Script Requirements
- Must export a `run()` function or have a default export
- Should use Puppeteer page object for browser interactions
- Can include Chrome Recorder specific step definitions
- Should handle errors gracefully

### Example Script Structure
```javascript
export async function run(extension, page) {
  // Chrome Recorder extension for step tracking
  if (extension && typeof extension.beforeAllSteps === 'function') {
    await extension.beforeAllSteps();
  }

  // Your test steps here
  await page.goto('https://example.com');
  await page.click('#login-button');
  // ... more steps
}
```

## Mock Data

For development and demo purposes, the app includes mock data:

- **Projects**: E-commerce Website, Mobile App API, Admin Dashboard
- **Scripts**: Login flows, product searches, cart operations, checkout processes
- **Test Execution**: Real Puppeteer automation with sample scripts

## API Integration

The desktop application integrates with a Laravel backend API for real-time data management. The API provides comprehensive endpoints for managing projects, screens, test scripts, and test results.

### Backend Requirements

- **Laravel 10+** with SQLite/MySQL database
- **API Key Authentication** for secure access
- **File Storage** for test scripts and screenshots
- **Database Indexes** for optimal performance

### API Configuration

Create a `.env` file in the `desktop/` directory:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### Key Features

- **Real-time Data Sync**: Projects, screens, and test scripts are fetched from the backend
- **Screen-based Script Filtering**: Test scripts are primarily filtered by screen_id for better organization
- **Advanced Search**: Full-text search across script names, descriptions, and content
- **Tag-based Organization**: Scripts can be categorized and filtered by tags
- **Performance Optimization**: Database indexes and efficient querying for large datasets

### Filtering Priority

The application uses a hierarchical filtering system:

1. **Screen ID (Primary)**: Scripts are primarily filtered by screen for logical organization
2. **Project ID (Secondary)**: Additional filtering by project for broader scope
3. **Search Terms**: Text-based search across script content
4. **Tags**: Frontend filtering for script categorization

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/projects` | GET | List all projects |
| `/projects/{id}/screens` | GET | Get screens for a project |
| `/test-scripts/search` | GET | Search scripts with filtering |
| `/test-scripts/{id}/content` | GET | Get script JavaScript content |
| `/test-results/save` | POST | Save test execution results |
| `/test-results/{id}/screenshot` | POST | Upload test screenshots |

### Data Flow

1. **Project Selection**: User selects a project from the dashboard
2. **Screen Loading**: Screens for the selected project are loaded
3. **Script Filtering**: Scripts are filtered by selected screen (primary) and project (secondary)
4. **Execution**: Selected scripts are executed with real-time progress tracking
5. **Results Submission**: Test results and screenshots are submitted to the backend

## File Structure

```
desktop/
├── public/
│   ├── electron.js      # Electron main process
│   └── index.html       # HTML template
├── src/
│   ├── components/      # React components
│   ├── services/        # API and execution services
│   │   ├── apiService.js # Backend API communication
│   │   ├── puppeteerRunner.js # Puppeteer automation engine
│   │   └── testExecutionService.js # Test execution orchestration
│   ├── App.js          # Main app component
│   └── index.js        # React entry point
├── screenshots/         # Test execution screenshots
├── build/              # Production build output
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Development Notes

- The app uses Material-UI for consistent design
- **Real Puppeteer integration** provides actual Chrome automation
- Chrome Recorder scripts are executed with full step tracking
- State management is handled with React hooks
- Electron provides native desktop app capabilities
- Screenshots are automatically organized and displayed

## Security Considerations

- API keys are stored in localStorage (consider more secure storage for production)
- All API communication should use HTTPS
- Validate and sanitize all user inputs
- Implement proper error handling for network issues
- Puppeteer runs in isolated browser context

## Performance Features

- **Real-time Monitoring**: Live progress updates and logging
- **Efficient Resource Management**: Proper browser cleanup and memory management
- **Optimized Screenshot Storage**: Organized file management
- **Performance Metrics**: Comprehensive browser performance data collection

## Troubleshooting

### Common Issues

#### Puppeteer Launch Failures
- Ensure sufficient system resources
- Check Chrome/Chromium installation
- Verify file permissions for screenshots directory

#### Script Execution Errors
- Verify script format and exports
- Check target URL accessibility
- Review console logs for detailed error information

#### Screenshot Failures
- Ensure screenshots directory is writable
- Check available disk space
- Verify Puppeteer permissions

## Contributing

1. Follow React/JavaScript best practices
2. Use Material-UI components for consistency
3. Add proper error handling and logging
4. Test both React and Electron functionality
5. Document any new features or API changes
6. Ensure Puppeteer integration works correctly

## Known Limitations

- Sequential execution only (no parallel processing)
- Requires active internet connection for API communication
- Chrome/Chromium must be available for Puppeteer automation
- Limited to Puppeteer-compatible test scripts
- Screenshots stored locally (not synced to backend)

## Future Enhancements

- **Parallel Execution**: Run multiple scripts simultaneously
- **Advanced Script Editor**: Inline script editing capabilities  
- **Results History**: Detailed execution history with search
- **Scheduled Execution**: Automated test scheduling
- **Real-time Updates**: WebSocket integration for live updates
- **Cloud Screenshots**: Sync screenshots to backend storage
- **Advanced Analytics**: Detailed performance analysis and reporting
- **Script Templates**: Pre-built script templates for common scenarios
- **Multi-language Support**: Internationalization support
- **Offline Mode**: Local script storage and execution