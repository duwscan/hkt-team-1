# Chrome Recorder Desktop App

A desktop application built with React and Electron for managing and executing Chrome Recorder test scripts.

## Overview

This application is part of the Chrome Recorder Test Management System, providing a desktop interface for:

- **API Key Authentication**: Secure access using API keys
- **Project & Script Management**: Browse and select test scripts by project, screen, and tags
- **Test Execution**: Run Chrome Recorder scripts sequentially with real-time feedback
- **Data Collection**: Capture URLs, console logs, and screenshots during test execution
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
- Search functionality
- Batch script selection

### ▶️ Test Execution
- Sequential script execution (no parallel processing)
- Real-time execution progress
- Live logging and error reporting
- Screenshot capture at each step
- Console error detection and logging
- Stop/start execution controls

### 📈 Results & Reporting
- Execution summary with success/failure counts
- Detailed logs with timestamps
- Test result submission to backend API
- Visual execution progress indicators

## Technology Stack

- **Frontend**: React 18 with Material-UI components
- **Desktop Framework**: Electron
- **Automation**: Puppeteer (for Chrome automation)
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
│   └── testExecutionService.js # Puppeteer test execution
└── App.js               # Main application component
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

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

## Usage

### 1. Authentication
- Launch the app
- Enter your API key to authenticate
- The key is stored locally for subsequent sessions

### 2. Project Management
- Select a project from the dropdown
- Filter by screen, tags, or search terms
- Select individual scripts or use "Select All"

### 3. Test Execution
- Click "Run Selected" to start execution
- Monitor progress in real-time
- View logs and results as tests complete
- Stop execution at any time if needed

### 4. Results
- Review execution summary
- Check success/failure counts
- View detailed logs for debugging
- Results are automatically submitted to backend API

## Mock Data

For development and demo purposes, the app includes mock data:

- **Projects**: E-commerce Website, Mobile App API, Admin Dashboard
- **Scripts**: Login flows, product searches, cart operations, checkout processes
- **Test Execution**: Simulated Puppeteer actions with realistic delays

## API Integration

The app communicates with a Laravel backend API for:

- API key validation
- Project and script metadata
- Test script file content
- Results submission and storage

### API Endpoints Expected:
- `GET /api/projects` - List projects
- `GET /api/screens?project_id=X` - List screens for project
- `GET /api/scripts?filters` - List scripts with filtering
- `POST /api/test-results` - Submit execution results

## File Structure

```
desktop/
├── public/
│   ├── electron.js      # Electron main process
│   └── index.html       # HTML template
├── src/
│   ├── components/      # React components
│   ├── services/        # API and execution services
│   ├── App.js          # Main app component
│   └── index.js        # React entry point
├── build/              # Production build output
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Development Notes

- The app uses Material-UI for consistent design
- Puppeteer integration allows for real Chrome automation
- State management is handled with React hooks
- Electron provides native desktop app capabilities
- Mock services enable development without backend dependency

## Security Considerations

- API keys are stored in localStorage (consider more secure storage for production)
- All API communication should use HTTPS
- Validate and sanitize all user inputs
- Implement proper error handling for network issues

## Contributing

1. Follow React/JavaScript best practices
2. Use Material-UI components for consistency
3. Add proper error handling and logging
4. Test both React and Electron functionality
5. Document any new features or API changes

## Known Limitations

- Sequential execution only (no parallel processing)
- Requires active internet connection for API communication
- Chrome/Chromium must be available for Puppeteer automation
- Limited to Puppeteer-compatible test scripts

## Future Enhancements

- Offline mode with local script storage
- Advanced filtering and search capabilities
- Test scheduling and automation
- Detailed analytics and reporting
- Custom script editor integration
- Multi-language support