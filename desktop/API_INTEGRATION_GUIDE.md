# API Integration Guide - Chrome Recorder Desktop App

## 🚀 Tích hợp API Backend thành công!

Desktop app đã được tích hợp hoàn toàn với Laravel backend API để thay thế mock data.

## 📋 Những gì đã được tích hợp

### 1. **Real API Service** (`src/services/apiService.js`)
- ✅ **Projects API**: `GET /api/projects`
- ✅ **Screens API**: `GET /api/projects/{id}/screens`
- ✅ **Scripts API**: `GET /api/test-scripts` với filtering
- ✅ **Script Content API**: `GET /api/test-scripts/{id}/content`
- ✅ **Test Results API**: `POST /api/test-results/save`
- ✅ **Screenshot Upload API**: `POST /api/test-results/{id}/screenshot`
- ✅ **API Keys API**: `GET /api/api-keys`

### 2. **API Configuration** (`src/config/api.js`)
- ✅ Centralized API endpoints
- ✅ Error handling và validation
- ✅ File upload limits và validation
- ✅ Environment-based configuration

### 3. **Enhanced Puppeteer Runner**
- ✅ Fetch script content từ API thay vì local files
- ✅ Execute scripts trong browser context
- ✅ Real-time execution tracking

### 4. **Improved Error Handling**
- ✅ User-friendly error messages
- ✅ Network error detection
- ✅ Authentication error handling
- ✅ Validation error display

## 🔧 Cách sử dụng

### 1. **Khởi động Backend**
```bash
cd backend
php artisan serve
# Backend sẽ chạy tại http://localhost:8000
```

### 2. **Khởi động Desktop App**
```bash
cd desktop
npm run dev
# App sẽ chạy tại http://localhost:3000
```

### 3. **Authentication**
- Nhập API key hợp lệ
- App sẽ validate key với backend
- Nếu thành công, chuyển đến Dashboard

### 4. **Data Loading**
- Projects, screens, scripts được load từ API
- Real-time data thay vì mock data
- Error handling cho network issues

### 5. **Script Execution**
- Scripts được fetch từ backend
- Execute trong Puppeteer browser
- Results được submit về backend
- Screenshots được upload tự động

## 📡 API Endpoints được sử dụng

### Authentication & Health
```http
GET /api/health
```

### Projects
```http
GET /api/projects
GET /api/projects/{id}/screens
```

### Test Scripts
```http
GET /api/test-scripts?project_id={id}&screen_id={id}&search={term}&tags[]={tag}
GET /api/test-scripts/{id}/content
```

### Test Results
```http
POST /api/test-results/save
PUT /api/test-results/{id}/status
POST /api/test-results/{id}/screenshot
GET /api/test-results/test-script/{id}
```

### API Keys
```http
GET /api/api-keys
```

## 🔐 Authentication

### API Key Header
```http
X-API-Key: your_api_key_here
```

### Validation Process
1. User nhập API key
2. App gọi `GET /api/projects` để validate
3. Nếu thành công → chuyển đến Dashboard
4. Nếu thất bại → hiển thị error message

## 📊 Data Flow

### 1. **App Startup**
```
User Input API Key → Validate with Backend → Load Projects → Dashboard
```

### 2. **Project Selection**
```
Select Project → Load Screens → Load Scripts → Display in UI
```

### 3. **Script Execution**
```
Select Scripts → Fetch Content from API → Execute with Puppeteer → Submit Results
```

### 4. **Screenshot Management**
```
Take Screenshot → Save Locally → Upload to Backend → Store Reference
```

## 🛠️ Configuration

### Environment Variables
```bash
# Tạo file .env trong desktop/ directory
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_DEBUG_MODE=true
```

### API Configuration
```javascript
// src/config/api.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  REQUEST: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
  }
};
```

## 🔍 Error Handling

### Network Errors
- Connection timeout
- Server unavailable
- Network connectivity issues

### Authentication Errors
- Invalid API key
- Expired API key
- Insufficient permissions

### Validation Errors
- Invalid file types
- File size exceeded
- Missing required fields

### User-Friendly Messages
```javascript
// Tự động format error messages
const errorMessage = formatApiError(error);
// Hiển thị trong UI với proper styling
```

## 📸 Screenshot Integration

### Upload Process
1. **Local Storage**: Screenshots được lưu trong `./screenshots/`
2. **Backend Upload**: Tự động upload lên backend sau khi execution
3. **File Validation**: Kiểm tra size và type trước khi upload
4. **Error Handling**: Graceful fallback nếu upload thất bại

### File Requirements
- **Format**: PNG, JPEG, GIF
- **Size**: Maximum 10MB
- **Naming**: `{type}_{timestamp}.png`

## 🧪 Testing API Integration

### 1. **Backend Health Check**
```bash
curl http://localhost:8000/api/health
```

### 2. **API Key Validation**
```bash
curl -H "X-API-Key: your_key" http://localhost:8000/api/projects
```

### 3. **Script Content Fetch**
```bash
curl -H "X-API-Key: your_key" http://localhost:8000/api/test-scripts/1/content
```

### 4. **Test Result Submission**
```bash
curl -X POST -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"test_script_id": 1, "status": "passed"}' \
  http://localhost:8000/api/test-results/save
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Backend Connection Failed**
```
Error: Network error. Please check your connection.
```
**Solution**: Kiểm tra backend có đang chạy không, kiểm tra port 8000

#### 2. **Authentication Failed**
```
Error: Authentication failed. Please check your API key.
```
**Solution**: Kiểm tra API key có đúng không, kiểm tra backend API key validation

#### 3. **Script Content Not Found**
```
Error: No script content received from API
```
**Solution**: Kiểm tra script ID có tồn tại không, kiểm tra backend script storage

#### 4. **Screenshot Upload Failed**
```
Error: File size exceeds limit of 10MB
```
**Solution**: Kiểm tra screenshot size, compress nếu cần

### Debug Mode
```bash
# Enable debug logging
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug
```

## 📈 Performance Features

### 1. **Request Optimization**
- Timeout handling (30s)
- Retry logic cho failed requests
- Efficient error handling

### 2. **File Management**
- Local screenshot caching
- Background upload processing
- Automatic cleanup

### 3. **User Experience**
- Loading states cho tất cả API calls
- Real-time progress updates
- Graceful error recovery

## 🔮 Future Enhancements

### 1. **Advanced API Features**
- WebSocket integration cho real-time updates
- Batch operations cho multiple scripts
- Advanced filtering và search

### 2. **Performance Improvements**
- Request caching
- Lazy loading
- Background sync

### 3. **Security Enhancements**
- JWT token support
- API rate limiting
- Enhanced validation

## ✅ Success Checklist

- [x] Backend API endpoints implemented
- [x] API key authentication working
- [x] Projects, screens, scripts loading from API
- [x] Script content fetching from API
- [x] Test result submission to backend
- [x] Screenshot upload to backend
- [x] Error handling và user feedback
- [x] Configuration management
- [x] Performance optimization
- [x] Documentation completed

## 🎯 Kết quả

Desktop app đã được tích hợp hoàn toàn với Laravel backend API:

- ✅ **Real Data**: Không còn mock data
- ✅ **API Integration**: Full backend communication
- ✅ **Error Handling**: Comprehensive error management
- ✅ **User Experience**: Professional UI với real-time updates
- ✅ **Performance**: Optimized API calls và file handling
- ✅ **Scalability**: Ready cho production deployment

Bây giờ bạn có thể sử dụng desktop app với real backend data và full API integration! 🚀
