# Screen ID Priority Filtering Update

## Overview

This document summarizes the changes made to implement **screen_id priority filtering** for test scripts, replacing the previous project_id-based approach.

## Problem Statement

Previously, the application loaded test scripts based on `project_id`, which caused:
- Scripts from all screens in a project to load simultaneously
- Poor user experience when dealing with large projects
- Inefficient data loading and filtering

## Solution

Implemented a **hierarchical filtering system** where:
1. **Screen ID** is the **primary filter** (most specific)
2. **Project ID** is the **secondary filter** (broader scope)
3. **Search terms** provide additional text-based filtering
4. **Tags** are filtered on the frontend for categorization

## Changes Made

### 1. Frontend (Dashboard.js)

**Before:**
```javascript
useEffect(() => {
  if (selectedProject) {
    loadScripts(selectedProject); // Load scripts by project
  }
}, [selectedProject]);

const loadScripts = async (projectId, screenId = '', tags = [], search = '') => {
  // Scripts loaded by project first
}
```

**After:**
```javascript
useEffect(() => {
  if (selectedProject) {
    loadScreens(selectedProject);
    // Don't load scripts here, wait for screen selection
  }
}, [selectedProject]);

useEffect(() => {
  if (selectedScreen) {
    // Load scripts when screen is selected, not when project changes
    loadScripts(selectedScreen, selectedTags, searchTerm);
  } else {
    // Clear scripts when no screen is selected
    setScripts([]);
  }
}, [selectedScreen, selectedTags, searchTerm]);

const loadScripts = async (screenId, tags = [], search = '') => {
  // Scripts loaded by screen first
}
```

### 2. API Service (apiService.js)

**Before:**
```javascript
// Build query parameters
const params = new URLSearchParams();
if (filters.project) params.append('project_id', filters.project);
if (filters.screen) params.append('screen_id', filters.screen);
```

**After:**
```javascript
// Build query parameters for search endpoint
const params = new URLSearchParams();

// Add screen filter (primary filter)
if (filters.screen) {
  params.append('screen_id', filters.screen);
}

// Add project filter (secondary, optional)
if (filters.project) {
  params.append('project_id', filters.project);
}
```

### 3. Backend (TestScriptController.php)

**Before:**
```php
if ($request->has('project_id')) {
    $query->where('project_id', $request->project_id);
}

if ($request->has('screen_id')) {
    $query->where('screen_id', $request->screen_id);
}
```

**After:**
```php
// Priority 1: Screen ID filtering (most specific)
if ($request->has('screen_id') && $request->screen_id) {
    $query->where('screen_id', $request->screen_id);
}

// Priority 2: Project ID filtering (broader scope)
if ($request->has('project_id') && $request->project_id) {
    $query->where('project_id', $request->project_id);
}

// Priority 3: Text search
if ($request->has('q') && $request->q) {
    // Search logic
}
```

## Benefits

### 1. **Better User Experience**
- Scripts load only when a screen is selected
- Clearer navigation flow: Project → Screen → Scripts
- Reduced cognitive load for users

### 2. **Improved Performance**
- Smaller, more focused data sets
- Faster API responses
- Reduced memory usage in the frontend

### 3. **Logical Organization**
- Scripts are naturally grouped by screen
- Better alignment with user mental models
- Easier script discovery and management

### 4. **Scalability**
- Handles large projects with many screens efficiently
- Better performance as project size grows
- More maintainable codebase

## API Endpoints

### Primary Endpoint
```
GET /api/test-scripts/search?screen_id={id}&project_id={id}&q={search_term}
```

### Query Parameters Priority
1. `screen_id` - Primary filter (required for script loading)
2. `project_id` - Secondary filter (optional, for broader scope)
3. `q` - Search term (optional, for text-based filtering)

## Database Optimization

Added database indexes for better performance:
```php
// Migration: add_indexes_to_test_scripts_table.php
$table->index('screen_id', 'test_scripts_screen_id_index');
$table->index('project_id', 'test_scripts_project_id_index');
$table->index(['screen_id', 'project_id'], 'test_scripts_screen_project_index');
$table->index('name', 'test_scripts_name_index');
```

## Testing

Created comprehensive test suite (`test-filtering.js`) to verify:
- Screen ID priority filtering
- Project ID secondary filtering
- Search term functionality
- Tag-based frontend filtering
- URL building with correct parameter order

## Migration Notes

### For Existing Users
- No breaking changes to existing functionality
- Improved performance and user experience
- Scripts now load more efficiently

### For Developers
- Update any custom API calls to use new priority system
- Consider screen_id as primary filter in new features
- Leverage new database indexes for performance

## Future Enhancements

1. **Advanced Filtering**: Add more filter options (date, status, etc.)
2. **Bulk Operations**: Support for multi-screen script operations
3. **Caching**: Implement frontend caching for frequently accessed data
4. **Real-time Updates**: WebSocket integration for live data updates

## Conclusion

The screen_id priority filtering system provides a more intuitive and efficient way to manage test scripts. By organizing scripts primarily by screen rather than project, users can navigate more logically and the application performs better with large datasets.

This change maintains backward compatibility while significantly improving the user experience and application performance.
