import { puppeteerRunner } from './puppeteerRunner';
import { apiService } from './apiService';

class TestExecutionService {
  constructor() {
    this.isRunning = false;
    this.apiKey = null;
    this.executionQueue = [];
    this.currentExecutionIndex = 0;
    this.executionResults = [];
    this.executionLogs = [];
  }

  /**
   * Initialize the test execution service
   * @param {string} apiKey - API key for authentication
   */
  async initialize(apiKey) {
    this.apiKey = apiKey;
    
    try {
      // Initialize Puppeteer runner with API key
      await puppeteerRunner.initialize({
        headless: false, // Show browser for desktop app
        slowMo: 1000, // 1 second delay between actions for visibility
        timeout: 30000,
        devtools: false,
        apiKey: apiKey // Pass API key for script fetching
      });
      
      console.log('✅ Test execution service initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize test execution service:', error.message);
      throw error;
    }
  }

  /**
   * Execute a single test script
   * @param {Object} script - Script object with metadata
   * @param {Object} options - Execution options
   * @param {Object} callbacks - Callback functions for progress updates
   */
  async executeScript(script, options = {}, callbacks = {}) {
    try {
      console.log(`🚀 Executing script: ${script.name}`);
      
      // Prepare callbacks for Puppeteer runner
      const puppeteerCallbacks = {
        onStepStart: (stepData) => {
          const logMessage = `Step ${stepData.step}: ${stepData.description}`;
          callbacks.onStepComplete?.({
            url: stepData.url || 'N/A',
            step: stepData.step,
            description: stepData.description
          });
          this.addLog(logMessage, 'info');
        },
        
        onStepComplete: (stepData) => {
          const logMessage = `Step completed: ${stepData.url}`;
          if (stepData.error) {
            this.addLog(`Console error: ${stepData.error}`, 'error');
          }
          callbacks.onStepComplete?.(stepData);
          this.addLog(logMessage, 'success');
        },
        
        onScreenshot: (screenshotPath) => {
          const logMessage = `Screenshot saved: ${screenshotPath}`;
          callbacks.onScreenshot?.(screenshotPath);
          this.addLog(logMessage, 'info');
        },
        
        onComplete: (result) => {
          callbacks.onComplete?.(result);
          this.addLog(`✅ Script completed successfully`, 'success');
        },
        
        onError: (result) => {
          callbacks.onError?.(result);
          this.addLog(`❌ Script failed: ${result.error}`, 'error');
        }
      };

      // Execute the script using Puppeteer runner
      const result = await puppeteerRunner.executeScript(script, options, puppeteerCallbacks);
      
      // Add to execution results
      this.executionResults.push(result);
      
      return result;

    } catch (error) {
      console.error('❌ Script execution failed:', error.message);
      
      const errorResult = {
        scriptId: script.id,
        scriptName: script.name,
        status: 'error',
        error: error.message,
        completedAt: new Date()
      };
      
      this.executionResults.push(errorResult);
      this.addLog(`❌ Script execution failed: ${error.message}`, 'error');
      
      throw error;
    }
  }

  /**
   * Execute multiple scripts sequentially
   * @param {Array} scripts - Array of script objects
   * @param {Object} options - Execution options
   * @param {Object} callbacks - Callback functions for progress updates
   */
  async executeScripts(scripts, options = {}, callbacks = {}) {
    if (this.isRunning) {
      throw new Error('Test execution is already running');
    }

    this.isRunning = true;
    this.executionQueue = [...scripts];
    this.currentExecutionIndex = 0;
    this.executionResults = [];
    this.executionLogs = [];

    try {
      this.addLog(`🚀 Starting execution of ${scripts.length} scripts`, 'info');
      
      // Execute scripts sequentially
      for (let i = 0; i < scripts.length; i++) {
        if (!this.isRunning) {
          this.addLog('⏹️ Execution stopped by user', 'warning');
          break;
        }

        const script = scripts[i];
        this.currentExecutionIndex = i + 1;
        
        this.addLog(`📝 Executing script ${i + 1}/${scripts.length}: ${script.name}`, 'info');
        
        try {
          await this.executeScript(script, options, {
            onStepComplete: callbacks.onStepComplete,
            onScreenshot: callbacks.onScreenshot
          });
          
          this.addLog(`✅ Script ${i + 1} completed successfully`, 'success');
          
        } catch (error) {
          this.addLog(`❌ Script ${i + 1} failed: ${error.message}`, 'error');
          
          // Continue with next script unless explicitly stopped
          if (error.message.includes('stopped')) {
            break;
          }
        }
        
        // Small delay between scripts
        if (i < scripts.length - 1) {
          await this.delay(1000);
        }
      }

      // Submit results to backend if available
      if (this.executionResults.length > 0) {
        try {
          await this.submitResultsToBackend();
        } catch (error) {
          this.addLog(`⚠️ Failed to submit results to backend: ${error.message}`, 'warning');
        }
      }

      this.addLog('🎉 All script executions completed!', 'success');
      
      return {
        totalScripts: scripts.length,
        successful: this.executionResults.filter(r => r.status === 'success').length,
        failed: this.executionResults.filter(r => r.status === 'error').length,
        results: this.executionResults
      };

    } catch (error) {
      this.addLog(`💥 Execution failed: ${error.message}`, 'error');
      throw error;
      
    } finally {
      this.isRunning = false;
      this.currentExecutionIndex = 0;
    }
  }

  /**
   * Stop current execution
   */
  async stopExecution() {
    if (this.isRunning) {
      this.isRunning = false;
      
      // Stop Puppeteer runner
      await puppeteerRunner.stopExecution();
      
      this.addLog('⏹️ Execution stopped by user', 'warning');
    }
  }

  /**
   * Get current execution status
   */
  getExecutionStatus() {
    return {
      isRunning: this.isRunning,
      currentScriptIndex: this.currentExecutionIndex,
      totalScripts: this.executionQueue.length,
      completedScripts: this.executionResults.length,
      successfulScripts: this.executionResults.filter(r => r.status === 'success').length,
      failedScripts: this.executionResults.filter(r => r.status === 'error').length
    };
  }

  /**
   * Get execution results
   */
  getExecutionResults() {
    return this.executionResults;
  }

  /**
   * Get execution logs
   */
  getExecutionLogs() {
    return this.executionLogs;
  }

  /**
   * Add log entry
   * @param {string} message - Log message
   * @param {string} type - Log type (info, success, warning, error)
   */
  addLog(message, type = 'info') {
    const logEntry = {
      timestamp: new Date(),
      message,
      type
    };
    
    this.executionLogs.push(logEntry);
    console.log(`[${logEntry.timestamp.toLocaleTimeString()}] ${message}`);
  }

  /**
   * Submit execution results to backend API
   */
  async submitResultsToBackend() {
    try {
      if (!this.apiKey) {
        throw new Error('API key not available');
      }

      const resultsData = {
        execution_summary: {
          total_scripts: this.executionResults.length,
          successful: this.executionResults.filter(r => r.status === 'success').length,
          failed: this.executionResults.filter(r => r.status === 'error').length,
          execution_time: new Date().toISOString()
        },
        script_results: this.executionResults.map(result => ({
          script_id: result.scriptId,
          script_name: result.scriptName,
          status: result.status,
          error: result.error,
          execution_time: result.executionTime,
          final_url: result.finalUrl,
          screenshots: result.screenshots,
          console_logs: result.consoleLogs,
          performance_metrics: result.performanceMetrics,
          execution_steps: result.executionSteps
        }))
      };

      const response = await apiService.submitTestResults(this.apiKey, resultsData);
      
      if (response.success) {
        this.addLog('📤 Results submitted to backend successfully', 'success');
      } else {
        throw new Error('Backend submission failed');
      }

    } catch (error) {
      console.error('Failed to submit results to backend:', error.message);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      this.isRunning = false;
      this.currentExecutionIndex = 0;
      this.executionQueue = [];
      this.executionResults = [];
      this.executionLogs = [];
      
      // Cleanup Puppeteer resources
      await puppeteerRunner.cleanup();
      
      console.log('🧹 Test execution service cleaned up');
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
    }
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const testExecutionService = new TestExecutionService();