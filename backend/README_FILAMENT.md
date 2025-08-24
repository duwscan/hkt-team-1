# Filament Admin Panel - Project Management System

## Mô tả
Hệ thống quản lý dự án sử dụng Filament để tạo giao diện admin với các tính năng:
- Quản lý Projects với API key authentication
- Quản lý Screens trong từng project
- Quản lý Test Scripts (JavaScript files)
- Quản lý Test Results với console output và screenshots
- API endpoints để submit test results

## Cài đặt

### 1. Cài đặt dependencies
```bash
composer install
```

### 2. Cài đặt Filament
```bash
composer require filament/filament:"^3.0" --with-all-dependencies
```

### 3. Publish Filament assets
```bash
php artisan filament:install --panels
```

### 4. Tạo database và chạy migrations
```bash
php artisan migrate
```

### 5. Tạo user admin
```bash
php artisan db:seed --class=AdminUserSeeder
```

### 6. Tạo symbolic link cho storage
```bash
php artisan storage:link
```

## Sử dụng

### Truy cập Admin Panel
- URL: `http://your-domain/admin`
- Email: `admin@example.com`
- Password: `password`

### Tạo Project mới
1. Vào Admin Panel > Projects
2. Click "Create Project"
3. Nhập tên dự án và mô tả
4. API key sẽ được tự động tạo

### Quản lý Screens
1. Vào Project > Screens
2. Click "Create Screen" để thêm screen mới
3. Nhập tên screen và URL

### Quản lý Test Scripts
1. Vào Screen > Test Scripts
2. Click "Create Test Script"
3. Upload file JavaScript
4. Chọn project và screen

### Xem Test Results
1. Vào Test Script > Test Results
2. Xem console output và screenshots
3. Tạo test result mới

## API Endpoints

### Authentication
Sử dụng API key trong header hoặc query parameter:
```
X-API-Key: your-api-key
```
hoặc
```
?api_key=your-api-key
```

### Test Results API

#### Tạo test result
```bash
POST /api/test-results
Content-Type: multipart/form-data

{
    "test_script_id": 1,
    "console_output": "Test completed successfully",
    "screenshot": [file],
    "status": "completed"
}
```

#### Lấy danh sách test results
```bash
GET /api/test-results?test_script_id=1
```

#### Xem chi tiết test result
```bash
GET /api/test-results/{id}
```

## Cấu trúc Database

### Tables
- `users` - Users cho admin panel
- `projects` - Projects với API key
- `screens` - Screens trong project
- `test_scripts` - JavaScript test files
- `test_results` - Kết quả test với console và screenshots

### Relationships
- Project has many Screens
- Screen has many TestScripts
- TestScript has many TestResults
- TestScript belongs to Project và Screen

## Tính năng chính

1. **Project Management**
   - Tạo, chỉnh sửa, xóa projects
   - Mỗi project có API key riêng
   - Xem số lượng screens và test scripts

2. **Screen Management**
   - Tạo screens trong project
   - Quản lý URL và tên screen
   - Xem số lượng test scripts

3. **Test Script Management**
   - Upload JavaScript files
   - Liên kết với project và screen
   - Quản lý test results

4. **Test Results**
   - Lưu console output
   - Lưu screenshots
   - Trạng thái test (pending, running, completed, failed)
   - Timestamp thực thi

5. **API Integration**
   - API key authentication
   - Submit test results
   - Retrieve test data

## Bảo mật

- API key authentication cho tất cả API endpoints
- File upload validation
- CSRF protection cho admin panel
- Session-based authentication cho admin

## Troubleshooting

### Lỗi thường gặp

1. **Filament không load được**
   - Kiểm tra composer dependencies
   - Chạy `php artisan config:clear`
   - Kiểm tra storage permissions

2. **API key không hoạt động**
   - Kiểm tra middleware registration
   - Verify API key trong database
   - Check request headers

3. **File upload không hoạt động**
   - Kiểm tra storage link
   - Verify directory permissions
   - Check file size limits

## Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Laravel logs: `storage/logs/laravel.log`
2. Filament documentation: https://filamentphp.com/docs
3. Laravel documentation: https://laravel.com/docs