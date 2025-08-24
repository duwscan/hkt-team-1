import axios from 'axios';

// Mock API base URL - replace with actual backend URL
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });
  }

  // Set API key for requests
  setApiKey(apiKey) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    this.client.defaults.headers.common['X-API-Key'] = apiKey;
  }

  // Validate API key
  async validateApiKey(apiKey) {
    try {
      // For demo purposes, we'll mock this validation
      // In real implementation, this would call the backend
      if (apiKey && apiKey.length > 5) {
        this.setApiKey(apiKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error('API Key validation error:', error);
      return false;
    }
  }

  // Get projects
  async getProjects(apiKey) {
    try {
      this.setApiKey(apiKey);
      
      // Mock data for demo - replace with actual API call
      // const response = await this.client.get('/projects');
      // return response.data;
      
      return [
        {
          id: 1,
          name: 'E-commerce Website',
          description: 'Main e-commerce platform testing'
        },
        {
          id: 2,
          name: 'Mobile App API',
          description: 'Mobile application backend API testing'
        },
        {
          id: 3,
          name: 'Admin Dashboard',
          description: 'Administrative dashboard testing'
        }
      ];
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  // Get screens for a project
  async getScreens(apiKey, projectId) {
    try {
      this.setApiKey(apiKey);
      
      // Mock data for demo
      const mockScreens = {
        1: [
          { id: 1, name: 'Login Page', domain: 'example.com', url_path: '/login' },
          { id: 2, name: 'Product Listing', domain: 'example.com', url_path: '/products' },
          { id: 3, name: 'Shopping Cart', domain: 'example.com', url_path: '/cart' },
          { id: 4, name: 'Checkout', domain: 'example.com', url_path: '/checkout' }
        ],
        2: [
          { id: 5, name: 'API Authentication', domain: 'api.example.com', url_path: '/auth' },
          { id: 6, name: 'User Profile', domain: 'api.example.com', url_path: '/profile' }
        ],
        3: [
          { id: 7, name: 'Dashboard Home', domain: 'admin.example.com', url_path: '/dashboard' },
          { id: 8, name: 'User Management', domain: 'admin.example.com', url_path: '/users' }
        ]
      };
      
      return mockScreens[projectId] || [];
    } catch (error) {
      console.error('Failed to get screens:', error);
      throw error;
    }
  }

  // Get scripts with filtering
  async getScripts(apiKey, filters = {}) {
    try {
      this.setApiKey(apiKey);
      
      // Mock data for demo
      let mockScripts = [
        {
          id: 1,
          name: 'Login Flow Test',
          version: '1.2',
          screen: { id: 1, name: 'Login Page' },
          project_id: 1,
          tags: ['auth', 'critical'],
          file_path: '/scripts/login_test.js'
        },
        {
          id: 2,
          name: 'Product Search Test',
          version: '2.1',
          screen: { id: 2, name: 'Product Listing' },
          project_id: 1,
          tags: ['search', 'products'],
          file_path: '/scripts/product_search.js'
        },
        {
          id: 3,
          name: 'Cart Add/Remove Test',
          version: '1.5',
          screen: { id: 3, name: 'Shopping Cart' },
          project_id: 1,
          tags: ['cart', 'critical'],
          file_path: '/scripts/cart_test.js'
        },
        {
          id: 4,
          name: 'Checkout Process Test',
          version: '3.0',
          screen: { id: 4, name: 'Checkout' },
          project_id: 1,
          tags: ['checkout', 'critical', 'payment'],
          file_path: '/scripts/checkout_test.js'
        },
        {
          id: 5,
          name: 'API Authentication Test',
          version: '1.0',
          screen: { id: 5, name: 'API Authentication' },
          project_id: 2,
          tags: ['api', 'auth'],
          file_path: '/scripts/api_auth_test.js'
        }
      ];

      // Apply filters
      if (filters.project) {
        mockScripts = mockScripts.filter(script => script.project_id == filters.project);
      }

      if (filters.screen) {
        mockScripts = mockScripts.filter(script => script.screen.id == filters.screen);
      }

      if (filters.tags && filters.tags.length > 0) {
        mockScripts = mockScripts.filter(script => 
          filters.tags.some(tag => script.tags.includes(tag))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        mockScripts = mockScripts.filter(script => 
          script.name.toLowerCase().includes(searchLower) ||
          script.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return mockScripts;
    } catch (error) {
      console.error('Failed to get scripts:', error);
      throw error;
    }
  }

  // Submit test results
  async submitTestResults(apiKey, results) {
    try {
      this.setApiKey(apiKey);
      
      // Mock submission for demo
      console.log('Submitting test results:', results);
      
      // In real implementation:
      // const response = await this.client.post('/test-results', results);
      // return response.data;
      
      return { success: true, id: Date.now() };
    } catch (error) {
      console.error('Failed to submit test results:', error);
      throw error;
    }
  }

  // Get test results
  async getTestResults(apiKey, filters = {}) {
    try {
      this.setApiKey(apiKey);
      
      // Mock data for demo
      return [
        {
          id: 1,
          script_name: 'Login Flow Test',
          project: 'E-commerce Website',
          screen: 'Login Page',
          status: 'success',
          executed_at: new Date(Date.now() - 3600000),
          duration: '2.5s'
        },
        {
          id: 2,
          script_name: 'Product Search Test',
          project: 'E-commerce Website',
          screen: 'Product Listing',
          status: 'failed',
          executed_at: new Date(Date.now() - 7200000),
          duration: '4.1s',
          error: 'Element not found: .search-button'
        }
      ];
    } catch (error) {
      console.error('Failed to get test results:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();