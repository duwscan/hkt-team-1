/**
 * Console Logger utility for capturing browser console output
 */
export class ConsoleLogger {
  constructor() {
    this.logs = [];
  }
  
  /**
   * Attach console logger to a Puppeteer page
   * @param {object} page - Puppeteer page object
   */
  attach(page) {
    page.on('console', (msg) => {
      const log = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
        url: page.url()
      };
      
      this.logs.push(log);
      
      // Also log to console for real-time monitoring
      if (log.type === 'error') {
        console.log(`🔴 Console Error: ${log.text}`);
      } else if (log.type === 'warning') {
        console.log(`🟡 Console Warning: ${log.text}`);
      } else if (log.type === 'log') {
        console.log(`🔵 Console Log: ${log.text}`);
      }
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      const log = {
        type: 'error',
        text: `Page Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        url: page.url(),
        stack: error.stack
      };
      
      this.logs.push(log);
      console.log(`💥 Page Error: ${error.message}`);
    });
    
    // Listen for response errors
    page.on('response', (response) => {
      if (response.status() >= 400) {
        const log = {
          type: 'error',
          text: `HTTP ${response.status()}: ${response.url()}`,
          timestamp: new Date().toISOString(),
          url: page.url(),
          status: response.status()
        };
        
        this.logs.push(log);
        console.log(`🔴 HTTP Error: ${response.status()} - ${response.url()}`);
      }
    });
    
    // Listen for request failures
    page.on('requestfailed', (request) => {
      const log = {
        type: 'error',
        text: `Request Failed: ${request.url()} - ${request.failure()?.errorText}`,
        timestamp: new Date().toISOString(),
        url: page.url(),
        failure: request.failure()
      };
      
      this.logs.push(log);
      console.log(`🔴 Request Failed: ${request.url()}`);
    });
  }
  
  /**
   * Get all captured logs
   * @returns {Array} Array of log objects
   */
  getLogs() {
    return this.logs;
  }
  
  /**
   * Get logs filtered by type
   * @param {string} type - Log type (error, warning, log, etc.)
   * @returns {Array} Filtered log array
   */
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }
  
  /**
   * Get error logs only
   * @returns {Array} Error logs
   */
  getErrors() {
    return this.getLogsByType('error');
  }
  
  /**
   * Get warning logs only
   * @returns {Array} Warning logs
   */
  getWarnings() {
    return this.getLogsByType('warning');
  }
  
  /**
   * Clear all logs
   */
  clear() {
    this.logs = [];
  }
  
  /**
   * Export logs as JSON
   * @returns {string} JSON string of logs
   */
  exportJSON() {
    return JSON.stringify(this.logs, null, 2);
  }
  
  /**
   * Get summary statistics
   * @returns {object} Log statistics
   */
  getSummary() {
    const summary = {
      total: this.logs.length,
      errors: this.getErrors().length,
      warnings: this.getWarnings().length,
      logs: this.getLogsByType('log').length,
      other: 0
    };
    
    summary.other = summary.total - summary.errors - summary.warnings - summary.logs;
    
    return summary;
  }
}