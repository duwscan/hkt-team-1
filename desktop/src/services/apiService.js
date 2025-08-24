import axios from 'axios';
import { API_CONFIG, getApiUrl, getEndpoint, formatApiError } from '../config/api.js';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.REQUEST.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  // Set API key for requests
  setApiKey(apiKey) {
    this.client.defaults.headers.common['X-API-Key'] = apiKey;
  }

  // Validate API key by making a test request
  async validateApiKey(apiKey) {
    try {
      this.setApiKey(apiKey);
      
      // Test API key by trying to get projects
      const response = await this.client.get(getEndpoint('PROJECTS'));
      
      if (response.status === 200) {
        console.log('✅ API key validated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ API key validation failed:', error.message);
      return false;
    }
  }

  // Get all projects
  async getProjects(apiKey) {
    try {
      this.setApiKey(apiKey);
      
      const response = await this.client.get(getEndpoint('PROJECTS'));
      console.log('📊 Projects loaded from API:', response.data.data.length);
      return response.data.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error('❌ Failed to get projects:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get screens for a project
  async getScreens(apiKey, projectId) {
    try {
      this.setApiKey(apiKey);
      
      const response = await this.client.get(getEndpoint('PROJECT_SCREENS', projectId));
      console.log(`📱 Screens loaded for project ${projectId}:`, response.data.data.length);
      return response.data.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error(`❌ Failed to get screens for project ${projectId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get test scripts with filtering
  async getScripts(apiKey, filters = {}) {
    try {
      this.setApiKey(apiKey);
      
      // Build query parameters for search endpoint
      const params = new URLSearchParams();
      
      // Add search term if provided
      if (filters.search) {
        params.append('q', filters.search);
      }
      
      // Add screen filter (primary filter)
      if (filters.screen) {
        params.append('screen_id', filters.screen);
      }
      
      // Add project filter (secondary, optional)
      if (filters.project) {
        params.append('project_id', filters.project);
      }
      
      // Note: Tags filtering is not supported by backend yet
      // We'll filter tags on frontend if needed
      if (filters.tags && filters.tags.length > 0) {
        console.log('⚠️ Tags filtering not supported by backend, filtering on frontend');
      }
      
      // Use search endpoint for filtering
      const endpoint = filters.search || filters.screen || filters.project
        ? `${getEndpoint('TEST_SCRIPTS')}/search?${params.toString()}`
        : getEndpoint('TEST_SCRIPTS');
      
      const response = await this.client.get(endpoint);
      console.log('📝 Scripts loaded from API:', response.data.data.length);
      
      let scripts = response.data.data;
      
      // Apply tags filtering on frontend if backend doesn't support it
      if (filters.tags && filters.tags.length > 0) {
        scripts = scripts.filter(script => 
          filters.tags.some(tag => script.tags?.some(scriptTag => scriptTag.name === tag || scriptTag === tag))
        );
        console.log(`📝 Scripts filtered by tags: ${scripts.length} remaining`);
      }
      
      // Transform API response to match our expected format
      return scripts.map(script => ({
        id: script.id,
        name: script.name,
        version: script.version || '1.0.0',
        screen: {
          id: script.screen_id,
          name: script.screen?.name || 'Unknown Screen'
        },
        project_id: script.project_id,
        tags: script.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [],
        file_path: script.js_file_path || `./scripts/script-${script.id}.js`,
        target_url: script.target_url || `https://example.com/script-${script.id}`,
        description: script.description || 'No description available'
      }));
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error('❌ Failed to get scripts:', error.message);
      throw new Error(errorMessage);
    }
  }

  // Get script content from backend
  async getScriptContent(apiKey, scriptId) {
    try {
      this.setApiKey(apiKey);
      
      const response = await this.client.get(getEndpoint('SCRIPT_CONTENT', scriptId), {
        responseType: 'text'
      });
      
      console.log(`📄 Script content loaded for script ${scriptId}`);
      return response.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error(`❌ Failed to get script content for ${scriptId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Submit test results to backend
  async submitTestResults(apiKey, results) {
    try {
      this.setApiKey(apiKey);
      
      // Transform results to match backend API format
      const resultsData = {
        test_script_id: results.scriptId,
        status: results.status === 'success' ? 'passed' : 'failed',
        execution_data: {
          steps: results.executionSteps?.map(step => step.description || step.type) || [],
          assertions: results.consoleLogs?.filter(log => log.type === 'log').map(log => log.text) || [],
          screenshots: results.screenshots || [],
          performance_metrics: results.performanceMetrics || []
        },
        started_at: results.startTime,
        completed_at: results.endTime,
        error_message: results.error || null,
        execution_time: parseInt(results.executionTime) || 0,
        screenshot_path: results.screenshots?.[0] || null,
        browser_info: {
          browser: 'Chrome (Puppeteer)',
          version: 'Puppeteer v24.0.0'
        },
        environment_info: {
          os: process.platform,
          node_version: process.version,
          app: 'Chrome Recorder Desktop'
        }
      };

      const response = await this.client.post(getEndpoint('TEST_RESULT_SAVE'), resultsData);
      
      console.log('📤 Test results submitted successfully:', response.data.data.id);
      return response.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error('❌ Failed to submit test results:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Update test result status
  async updateTestResultStatus(apiKey, resultId, statusData) {
    try {
      this.setApiKey(apiKey);
      
      const response = await this.client.put(getEndpoint('TEST_RESULT_STATUS', resultId), statusData);
      
      console.log(`📝 Test result ${resultId} status updated successfully`);
      return response.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error(`❌ Failed to update test result ${resultId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Upload screenshot for test result
  async uploadScreenshot(apiKey, resultId, screenshotFile, description = '') {
    try {
      this.setApiKey(apiKey);
      
      // Validate file size
      if (screenshotFile.size > API_CONFIG.UPLOAD.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds limit of ${API_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      // Validate file type
      if (!API_CONFIG.UPLOAD.ALLOWED_IMAGE_TYPES.includes(screenshotFile.type)) {
        throw new Error(`File type ${screenshotFile.type} is not allowed`);
      }
      
      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      if (description) {
        formData.append('description', description);
      }

      const response = await this.client.post(getEndpoint('TEST_RESULT_SCREENSHOT', resultId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log(`📸 Screenshot uploaded for test result ${resultId}`);
      return response.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error(`❌ Failed to upload screenshot for result ${resultId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get test results for a script
  async getTestResults(apiKey, scriptId) {
    try {
      this.setApiKey(apiKey);
      
      const response = await this.client.get(getEndpoint('TEST_RESULTS_BY_SCRIPT', scriptId));
      
      console.log(`📊 Test results loaded for script ${scriptId}:`, response.data.data.length);
      return response.data.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error(`❌ Failed to get test results for script ${scriptId}:`, errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get API keys for the user
  async getApiKeys(apiKey) {
    try {
      this.setApiKey(apiKey);
      
      const response = await this.client.get(getEndpoint('API_KEYS'));
      console.log('🔑 API keys loaded:', response.data.data.length);
      return response.data.data;
      
    } catch (error) {
      const errorMessage = formatApiError(error);
      console.error('❌ Failed to get API keys:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Health check for backend connectivity
  async healthCheck() {
    try {
      const response = await this.client.get(getEndpoint('HEALTH'));
      return response.status === 200;
    } catch (error) {
      console.error('❌ Backend health check failed:', error.message);
      return false;
    }
  }
}

export const apiService = new ApiService();