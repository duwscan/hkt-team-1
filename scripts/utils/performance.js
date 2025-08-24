/**
 * Performance measurement utilities for browser automation
 */

/**
 * Measure various performance metrics of a page
 * @param {object} page - Puppeteer page object
 * @returns {object} Performance metrics
 */
export async function measurePerformance(page) {
  try {
    const metrics = await page.metrics();
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];
      
      return {
        // Navigation timing
        navigationStart: timing.navigationStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        loadEventEnd: timing.loadEventEnd,
        
        // Calculated timings
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        pageLoad: timing.loadEventEnd - timing.navigationStart,
        
        // Performance API data (if available)
        ...(navigation && {
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
          domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          resourceLoading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd
        })
      };
    });
    
    // Web Vitals-like metrics
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          vitals.firstContentfulPaint = fcpEntry.startTime;
        }
        
        // Largest Contentful Paint (if available)
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                vitals.largestContentfulPaint = lastEntry.startTime;
              }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Give it a moment to collect LCP
            setTimeout(() => {
              observer.disconnect();
              resolve(vitals);
            }, 1000);
          } catch (e) {
            resolve(vitals);
          }
        } else {
          resolve(vitals);
        }
      });
    });
    
    return {
      // Puppeteer metrics
      timestamp: metrics.Timestamp,
      documents: metrics.Documents,
      frames: metrics.Frames,
      jsEventListeners: metrics.JSEventListeners,
      nodes: metrics.Nodes,
      layoutCount: metrics.LayoutCount,
      recalcStyleCount: metrics.RecalcStyleCount,
      layoutDuration: metrics.LayoutDuration,
      recalcStyleDuration: metrics.RecalcStyleDuration,
      scriptDuration: metrics.ScriptDuration,
      taskDuration: metrics.TaskDuration,
      jsHeapUsedSize: `${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`,
      jsHeapTotalSize: `${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`,
      
      // Navigation timing
      ...performanceTiming,
      
      // Web Vitals
      ...vitals,
      
      // Formatted timing strings
      domContentLoadedTime: `${performanceTiming.domContentLoaded}ms`,
      pageLoadTime: `${performanceTiming.pageLoad}ms`
    };
    
  } catch (error) {
    console.error('❌ Error measuring performance:', error.message);
    return {
      error: error.message,
      timestamp: Date.now()
    };
  }
}

/**
 * Monitor page load speed
 * @param {object} page - Puppeteer page object
 * @param {string} url - URL to navigate to
 * @returns {object} Load timing metrics
 */
export async function measurePageLoad(page, url) {
  const startTime = Date.now();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    const performanceMetrics = await measurePerformance(page);
    
    return {
      url,
      totalLoadTime: `${loadTime}ms`,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      ...performanceMetrics
    };
    
  } catch (error) {
    console.error('❌ Error measuring page load:', error.message);
    throw error;
  }
}

/**
 * Get resource timing information
 * @param {object} page - Puppeteer page object
 * @returns {Array} Resource timing entries
 */
export async function getResourceTiming(page) {
  try {
    return await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType,
        startTime: resource.startTime,
        endTime: resource.responseEnd
      }));
    });
  } catch (error) {
    console.error('❌ Error getting resource timing:', error.message);
    return [];
  }
}