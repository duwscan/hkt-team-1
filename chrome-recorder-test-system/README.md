# Chrome Recorder Test Management System

A comprehensive system for managing and executing Chrome Recorder test scripts for automated testing. Built with modern technologies including Laravel, Next.js, Electron, and Puppeteer.

## 🎯 Project Overview

This system allows QA testers and developers to:
- Record test scenarios using Chrome DevTools Recorder
- Import and manage test scripts (.js files)
- Execute tests automatically using Puppeteer
- Collect test results, screenshots, and console logs
- Manage projects, screens, and test scripts through a web admin interface
- Run tests from a desktop application

## 🏗️ Architecture

The system consists of three main components:

1. **API Backend (Laravel)** - RESTful API for data management
2. **Web Admin (Next.js)** - Web-based administration interface
3. **PC App (Electron)** - Desktop application for test execution

## 🚀 Features

### Web Admin (8 points)
- ✅ API key authentication
- ✅ Project management (CRUD operations)
- ✅ Screen management (CRUD operations)
- ✅ Test script management with auto-versioning
- ✅ Tag management (unique per project)
- ✅ Test result viewing and search
- ✅ Modern, responsive UI with Tailwind CSS

### PC App (6 points)
- ✅ API key authentication
- ✅ Project, screen, and test script selection
- ✅ Test script file import (.js files)
- ✅ Sequential test execution (no parallel processing)
- ✅ Chrome automation with Puppeteer
- ✅ Data collection (URLs, console logs, screenshots)
- ✅ Results display and management

### API Backend (3 points)
- ✅ RESTful API endpoints
- ✅ API key authentication middleware
- ✅ Database migrations and models
- ✅ Comprehensive data management

## 🛠️ Technology Stack

- **Backend**: Laravel 10 (PHP 8.1+)
- **Frontend**: Next.js 14, React 18, TypeScript
- **Desktop App**: Electron 27, Puppeteer 21
- **Database**: MySQL/PostgreSQL
- **Styling**: Tailwind CSS
- **Authentication**: API Key-based

## 📁 Project Structure

```
chrome-recorder-test-system/
├── api-backend/                 # Laravel API backend
│   ├── app/
│   │   ├── Http/Controllers/   # API controllers
│   │   ├── Http/Middleware/    # API key middleware
│   │   └── Models/             # Eloquent models
│   ├── database/migrations/    # Database migrations
│   ├── routes/api.php          # API routes
│   └── config/                 # Configuration files
├── web-admin/                   # Next.js web application
│   ├── app/                    # App router pages
│   ├── components/             # React components
│   └── styles/                 # CSS and Tailwind config
├── pc-app/                      # Electron desktop application
│   ├── main.js                 # Main process
│   ├── renderer.js             # Renderer process
│   └── index.html              # App interface
└── shared/                      # Shared utilities and types
```

## 🚀 Quick Start

### Prerequisites

- PHP 8.1+
- Node.js 18+
- MySQL/PostgreSQL
- Composer
- npm/yarn

### 1. API Backend Setup

```bash
cd api-backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chrome_recorder_tests
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
php artisan serve
```

### 2. Web Admin Setup

```bash
cd web-admin

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. PC App Setup

```bash
cd pc-app

# Install dependencies
npm install

# Start the application
npm start
```

## 🔑 API Key Setup

1. Create an API key in the database:
```sql
INSERT INTO api_keys (name, key, is_active) 
VALUES ('Test Key', 'cr_your_generated_key_here', 1);
```

2. Use this API key in both the web admin and PC app

## 📊 Database Schema

The system includes the following main entities:

- **Projects**: Test project containers
- **Screens**: Web pages/screens to test
- **Test Scripts**: Chrome Recorder generated scripts
- **Tags**: Categorization for test scripts
- **Test Results**: Execution results and data
- **API Keys**: Authentication keys

## 🔄 API Endpoints

### Authentication
- `GET /api/auth/api-key` - Validate API key

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Screens
- `GET /api/screens` - List screens
- `POST /api/screens` - Create screen
- `PUT /api/screens/{id}` - Update screen
- `DELETE /api/screens/{id}` - Delete screen

### Test Scripts
- `GET /api/test-scripts` - List test scripts
- `POST /api/test-scripts` - Create test script
- `PUT /api/test-scripts/{id}` - Update test script
- `DELETE /api/test-scripts/{id}` - Delete test script
- `GET /api/test-scripts/search` - Search test scripts
- `POST /api/test-scripts/{id}/run` - Run test script

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

### Test Results
- `GET /api/test-results` - List test results
- `GET /api/test-results/search` - Search test results
- `DELETE /api/test-results/{id}` - Delete test result

## 🧪 Test Execution Flow

1. **Setup**: Configure API key and select project/screen
2. **Import**: Load Chrome Recorder .js file or select from database
3. **Execute**: Run test using Puppeteer automation
4. **Collect**: Gather URLs, console logs, screenshots
5. **Store**: Save results to database via API
6. **Review**: View results in web admin or PC app

## 🎨 UI Features

- **Modern Design**: Clean, professional interface using Tailwind CSS
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Updates**: Live status updates and notifications
- **Intuitive Navigation**: Easy-to-use tab-based interface
- **Data Visualization**: Clear presentation of test results and statistics

## 🔒 Security Features

- **API Key Authentication**: Secure access control
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Protection**: Laravel's built-in protection
- **XSS Prevention**: Proper output escaping
- **CORS Configuration**: Controlled cross-origin access

## 📱 Platform Support

- **Web Admin**: All modern browsers
- **PC App**: Windows, macOS, Linux
- **API Backend**: Cross-platform PHP support

## 🚀 Deployment

### Production Build

```bash
# Web Admin
cd web-admin
npm run build
npm start

# PC App
cd pc-app
npm run build
```

### Docker Support

Docker configurations can be added for easy deployment and scaling.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- **Parallel Execution**: Support for running multiple tests simultaneously
- **Advanced Reporting**: Detailed test analytics and reporting
- **Integration**: CI/CD pipeline integration
- **Mobile App**: Native mobile application
- **Cloud Storage**: Screenshot and result storage in the cloud
- **Team Collaboration**: Multi-user support and permissions

---

**Built for WEB1 AI Innovation Hackathon** 🚀

*Automate your testing workflow with Chrome Recorder and modern web technologies.*