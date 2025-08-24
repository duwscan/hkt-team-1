# API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Test Management System. The system uses API Key authentication for all protected endpoints.

## Authentication

All API endpoints require authentication using an API Key in the request header:

```
X-API-Key: your_api_key_here
```

## Base URL

```
http://localhost:8000/api
```

## API Endpoints

### 1. Project Management

#### Get Project Details
```http
GET /projects/{id}
```

**Description:** Retrieve detailed information about a specific project.

**Parameters:**
- `id` (path, required): Project ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Project Name",
    "description": "Project Description",
    "created_at": "2025-08-24T10:00:00.000000Z",
    "updated_at": "2025-08-24T10:00:00.000000Z"
  },
  "message": "Project retrieved successfully"
}
```

#### Get Project Screens
```http
GET /projects/{id}/screens
```

**Description:** Retrieve all screens belonging to a specific project.

**Parameters:**
- `id` (path, required): Project ID

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Screen Name",
      "domain": "example.com",
      "url_path": "/dashboard",
      "description": "Screen Description",
      "project_id": 1,
      "created_at": "2025-08-24T10:00:00.000000Z",
      "updated_at": "2025-08-24T10:00:00.000000Z"
    }
  ],
  "message": "Screens retrieved successfully"
}
```

### 2. Screen Management

#### Get Screen Details
```http
GET /screens/{id}
```

**Description:** Retrieve detailed information about a specific screen.

**Parameters:**
- `id` (path, required): Screen ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Screen Name",
    "domain": "example.com",
    "url_path": "/dashboard",
    "description": "Screen Description",
    "project_id": 1,
    "created_at": "2025-08-24T10:00:00.000000Z",
    "updated_at": "2025-08-24T10:00:00.000000Z"
  },
  "message": "Screen retrieved successfully"
}
```

### 3. Test Script Management

#### Get Test Script Content
```http
GET /test-scripts/{id}/content
```

**Description:** Retrieve the raw JavaScript content of a test script file.

**Parameters:**
- `id` (path, required): Test Script ID

**Response:**
- **Content-Type:** `application/javascript`
- **Body:** Raw JavaScript file content

**Error Responses:**
```json
{
  "error": "No JavaScript file found for this test script",
  "message": "Test script does not have an uploaded JavaScript file"
}
```

#### Get Test Script Download Info
```http
GET /test-scripts/{id}/download
```

**Description:** Get information about downloading a test script file.

**Parameters:**
- `id` (path, required): Test Script ID

**Response:**
```json
{
  "data": {
    "file_name": "test-script.js",
    "download_url": "http://localhost:8000/storage/test-scripts/filename.js",
    "content_type": "application/javascript"
  },
  "message": "JavaScript file download info retrieved successfully"
}
```

### 4. Test Result Management

#### Save Test Result
```http
POST /test-results/save
```

**Description:** Create a new test result record.

**Request Body:**
```json
{
  "test_script_id": 1,
  "status": "passed",
  "execution_data": {
    "steps": ["Step 1", "Step 2"],
    "assertions": ["Element found", "Text matches"]
  },
  "started_at": "2025-08-24T10:00:00.000000Z",
  "completed_at": "2025-08-24T10:05:00.000000Z",
  "error_message": null,
  "execution_time": 1500,
  "screenshot_path": null,
  "browser_info": {
    "browser": "Chrome",
    "version": "120.0.0.0"
  },
  "environment_info": {
    "os": "macOS",
    "node_version": "18.0.0"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "test_script_id": 1,
    "status": "passed",
    "execution_data": {...},
    "started_at": "2025-08-24T10:00:00.000000Z",
    "completed_at": "2025-08-24T10:05:00.000000Z",
    "execution_time": 1500,
    "screenshot_path": null,
    "browser_info": {...},
    "environment_info": {...},
    "created_at": "2025-08-24T10:05:00.000000Z",
    "updated_at": "2025-08-24T10:05:00.000000Z"
  },
  "message": "Test result saved successfully"
}
```

#### Update Test Result Status
```http
PUT /test-results/{id}/status
```

**Description:** Update the status and other fields of an existing test result.

**Parameters:**
- `id` (path, required): Test Result ID

**Request Body:**
```json
{
  "status": "failed",
  "error_message": "Element not found",
  "execution_time": 2000
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "status": "failed",
    "error_message": "Element not found",
    "execution_time": 2000,
    "updated_at": "2025-08-24T10:10:00.000000Z"
  },
  "message": "Test result status updated successfully"
}
```

#### Get Test Results by Test Script
```http
GET /test-results/test-script/{id}
```

**Description:** Retrieve all test results for a specific test script.

**Parameters:**
- `id` (path, required): Test Script ID

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "test_script_id": 1,
      "status": "passed",
      "execution_data": {...},
      "started_at": "2025-08-24T10:00:00.000000Z",
      "completed_at": "2025-08-24T10:05:00.000000Z",
      "execution_time": 1500,
      "screenshot_path": null,
      "browser_info": {...},
      "environment_info": {...},
      "created_at": "2025-08-24T10:05:00.000000Z",
      "updated_at": "2025-08-24T10:05:00.000000Z"
    }
  ],
  "message": "Test results retrieved successfully"
}
```

### 5. Screenshot Management

#### Upload Screenshot
```http
POST /test-results/{id}/screenshot
```

**Description:** Upload a screenshot for a test result.

**Parameters:**
- `id` (path, required): Test Result ID

**Request Body:**
- **Content-Type:** `multipart/form-data`
- `screenshot` (file, required): Image file (JPEG, PNG, JPG, GIF, max 10MB)
- `description` (string, optional): Description of the screenshot

**Response:**
```json
{
  "data": {
    "id": 1,
    "screenshot_path": "test-screenshots/filename.png",
    "screenshot_url": "http://localhost:8000/storage/test-screenshots/filename.png",
    "description": "Test failure screenshot",
    "file_size": 1024000,
    "mime_type": "image/png"
  },
  "message": "Screenshot uploaded successfully"
}
```

#### Get Screenshot Info
```http
GET /test-results/{id}/screenshot
```

**Description:** Get information about a screenshot for a test result.

**Parameters:**
- `id` (path, required): Test Result ID

**Response:**
```json
{
  "data": {
    "id": 1,
    "screenshot_path": "test-screenshots/filename.png",
    "screenshot_url": "http://localhost:8000/storage/test-screenshots/filename.png",
    "file_size": 1024000,
    "mime_type": "image/png",
    "last_modified": 1692873600
  },
  "message": "Screenshot information retrieved successfully"
}
```

#### Delete Screenshot
```http
DELETE /test-results/{id}/screenshot
```

**Description:** Delete a screenshot for a test result.

**Parameters:**
- `id` (path, required): Test Result ID

**Response:**
```json
{
  "message": "Screenshot deleted successfully"
}
```

### 6. API Key Management

#### List API Keys
```http
GET /api-keys
```

**Description:** Retrieve all API keys for the authenticated user.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "API Key Name",
      "key": "key_prefix_...",
      "is_active": true,
      "created_at": "2025-08-24T10:00:00.000000Z",
      "updated_at": "2025-08-24T10:00:00.000000Z"
    }
  ],
  "message": "API keys retrieved successfully"
}
```

## Data Models

### Project
```json
{
  "id": 1,
  "name": "Project Name",
  "description": "Project Description",
  "created_at": "2025-08-24T10:00:00.000000Z",
  "updated_at": "2025-08-24T10:00:00.000000Z"
}
```

### Screen
```json
{
  "id": 1,
  "name": "Screen Name",
  "domain": "example.com",
  "url_path": "/dashboard",
  "description": "Screen Description",
  "project_id": 1,
  "created_at": "2025-08-24T10:00:00.000000Z",
  "updated_at": "2025-08-24T10:00:00.000000Z"
}
```

### TestScript
```json
{
  "id": 1,
  "name": "Test Script Name",
  "version": "1.0.0",
  "project_id": 1,
  "screen_id": 1,
  "js_file_path": "test-scripts/filename.js",
  "created_at": "2025-08-24T10:00:00.000000Z",
  "updated_at": "2025-08-24T10:00:00.000000Z"
}
```

### TestResult
```json
{
  "id": 1,
  "test_script_id": 1,
  "project_id": 1,
  "screen_id": 1,
  "status": "passed",
  "execution_data": {
    "steps": ["Step 1", "Step 2"],
    "assertions": ["Element found", "Text matches"]
  },
  "started_at": "2025-08-24T10:00:00.000000Z",
  "completed_at": "2025-08-24T10:05:00.000000Z",
  "error_message": null,
  "execution_time": 1500,
  "screenshot_path": "test-screenshots/filename.png",
  "browser_info": {
    "browser": "Chrome",
    "version": "120.0.0.0"
  },
  "environment_info": {
    "os": "macOS",
    "node_version": "18.0.0"
  },
  "created_at": "2025-08-24T10:05:00.000000Z",
  "updated_at": "2025-08-24T10:05:00.000000Z"
}
```

### ApiKey
```json
{
  "id": 1,
  "name": "API Key Name",
  "key": "key_prefix_...",
  "is_active": true,
  "created_at": "2025-08-24T10:00:00.000000Z",
  "updated_at": "2025-08-24T10:00:00.000000Z"
}
```

## Status Codes

### Test Result Statuses
- `pending`: Test is waiting to be executed
- `running`: Test is currently executing
- `passed`: Test completed successfully
- `failed`: Test completed with failures
- `skipped`: Test was skipped

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": {
    "field_name": ["Validation error message"]
  }
}
```

## File Upload Guidelines

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

### File Size Limits
- **Screenshots**: Maximum 10MB
- **Test Scripts**: Maximum 10MB

### Storage Locations
- **Screenshots**: `storage/app/public/test-screenshots/`
- **Test Scripts**: `storage/app/public/test-scripts/`

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is enabled for all origins. Configure CORS settings in `config/cors.php` for production use.

## Testing

All API endpoints are covered by comprehensive test suites:

- **ProjectDetailTest**: Tests project and screen endpoints
- **TestScriptContentApiTest**: Tests test script content endpoints
- **TestResultApiTest**: Tests test result management endpoints
- **TestResultScreenshotApiTest**: Tests screenshot management endpoints

Run tests with:
```bash
php artisan test
```

## Examples

### Complete Test Workflow

1. **Create Test Result**
```bash
curl -X POST "http://localhost:8000/api/test-results/save" \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "test_script_id": 1,
    "status": "running",
    "execution_data": {"steps": ["Start test"]},
    "started_at": "2025-08-24T10:00:00.000000Z"
  }'
```

2. **Upload Screenshot on Failure**
```bash
curl -X POST "http://localhost:8000/api/test-results/1/screenshot" \
  -H "X-API-Key: your_api_key" \
  -F "screenshot=@failure-screenshot.png" \
  -F "description=Element not found error"
```

3. **Update Test Result Status**
```bash
curl -X PUT "http://localhost:8000/api/test-results/1/status" \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "failed",
    "error_message": "Element not found",
    "completed_at": "2025-08-24T10:05:00.000000Z",
    "execution_time": 5000
  }'
```

## Support

For API support and questions, please refer to the project documentation or contact the development team.
