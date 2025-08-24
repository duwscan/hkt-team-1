/**
 * API Configuration for Chrome Recorder Desktop App
 */

export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication & Health
    HEALTH: '/health',
    
    // Projects
    PROJECTS: '/projects',
    PROJECT_SCREENS: (id) => `/projects/${id}/screens`,
    
    // Test Scripts
    TEST_SCRIPTS: '/test-scripts',
    SCRIPT_CONTENT: (id) => `/test-scripts/${id}/content`,
    SCRIPT_DOWNLOAD: (id) => `/test-scripts/${id}/download`,
    
    // Test Results
    TEST_RESULTS: '/test-results',
    TEST_RESULT_SAVE: '/test-results/save',
    TEST_RESULT_STATUS: (id) => `/test-results/${id}/status`,
    TEST_RESULT_SCREENSHOT: (id) => `/test-results/${id}/screenshot`,
    TEST_RESULTS_BY_SCRIPT: (id) => `/test-results/test-script/${id}`,
    
    // API Keys
    API_KEYS: '/api-keys'
  },
  
  // Request configuration
  REQUEST: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },
  
  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    ALLOWED_SCRIPT_TYPES: ['application/javascript', 'text/javascript']
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_ERROR: 'Authentication failed. Please check your API key.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Invalid data provided. Please check your input.',
    NOT_FOUND: 'Resource not found. Please check your request.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred.'
  }
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Get API endpoint by name
 * @param {string} name - Endpoint name
 * @param {...any} params - Parameters for the endpoint
 * @returns {string} API endpoint path
 */
export const getEndpoint = (name, ...params) => {
  const endpoint = API_CONFIG.ENDPOINTS[name];
  
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  
  return endpoint;
};

/**
 * Validate API response
 * @param {Object} response - API response object
 * @returns {boolean} True if response is valid
 */
export const validateApiResponse = (response) => {
  return response && 
         response.data && 
         response.status >= 200 && 
         response.status < 300;
};

/**
 * Format API error message
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export const formatApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return API_CONFIG.ERROR_MESSAGES.AUTH_ERROR;
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return API_CONFIG.ERROR_MESSAGES.NOT_FOUND;
      case 422:
        return data.message || API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR;
      case 500:
        return API_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
      default:
        return data.message || `Request failed with status ${status}`;
    }
  } else if (error.request) {
    return API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
  } else if (error.code === 'ECONNABORTED') {
    return API_CONFIG.ERROR_MESSAGES.TIMEOUT;
  } else {
    return error.message || API_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

export default API_CONFIG;
