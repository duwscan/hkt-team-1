/**
 * Custom Puppeteer Replay Extension that integrates with our utilities
 * This extension provides screenshot capture, console logging, and performance measurement
 * capabilities for Chrome Recorder scripts
 */

import { takeScreenshot } from './screenshot.js';
import { measurePerformance } from './performance.js';

export class ChromeRecorderExtension {
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      outputDir: options.outputDir || './output',
      takeStepScreenshots: options.takeStepScreenshots !== false,
      logSteps: options.logSteps !== false,
      measurePerformance: options.measurePerformance !== false,
      ...options
    };
    this.stepCount = 0;
    this.results = {
      steps: [],
      screenshots: [],
      performance: [],
      startTime: Date.now(),
      errors: []
    };
  }

  /**
   * Called before all steps are executed
   */
  async beforeAllSteps() {
    if (this.options.logSteps) {
      console.log('🎬 Starting Chrome Recorder script execution...');
    }
    
    // Take initial screenshot
    if (this.options.takeStepScreenshots) {
      try {
        const screenshotPath = await takeScreenshot(this.page, this.options.outputDir, 'step-0-initial');
        this.results.screenshots.push({
          step: 0,
          type: 'initial',
          path: screenshotPath,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error taking initial screenshot:', error.message);
        this.results.errors.push({
          step: 0,
          type: 'screenshot',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Initial performance measurement
    if (this.options.measurePerformance) {
      try {
        const performance = await measurePerformance(this.page);
        this.results.performance.push({
          step: 0,
          type: 'initial',
          metrics: performance,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error measuring initial performance:', error.message);
      }
    }
  }

  /**
   * Called before each step is executed
   */
  async beforeEachStep(step, flow) {
    this.stepCount++;
    
    if (this.options.logSteps) {
      console.log(`📝 Step ${this.stepCount}: ${step.type} ${step.url || step.selectors?.[0]?.[0] || ''}`);
    }

    // Record step info
    this.results.steps.push({
      stepNumber: this.stepCount,
      type: step.type,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      step: { ...step }
    });
  }

  /**
   * Called after each step is executed
   */
  async afterEachStep(step, flow) {
    try {
      // Take screenshot after each step
      if (this.options.takeStepScreenshots) {
        try {
          const screenshotPath = await takeScreenshot(
            this.page, 
            this.options.outputDir, 
            `step-${this.stepCount}-${step.type}`
          );
          this.results.screenshots.push({
            step: this.stepCount,
            type: step.type,
            path: screenshotPath,
            timestamp: new Date().toISOString(),
            url: this.page.url()
          });
        } catch (error) {
          console.error(`❌ Error taking screenshot for step ${this.stepCount}:`, error.message);
          this.results.errors.push({
            step: this.stepCount,
            type: 'screenshot',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Measure performance after certain steps
      if (this.options.measurePerformance && ['navigate', 'click', 'change'].includes(step.type)) {
        try {
          const performance = await measurePerformance(this.page);
          this.results.performance.push({
            step: this.stepCount,
            type: step.type,
            metrics: performance,
            timestamp: new Date().toISOString(),
            url: this.page.url()
          });
        } catch (error) {
          console.error(`❌ Error measuring performance for step ${this.stepCount}:`, error.message);
        }
      }

      // Update step info with completion
      if (this.results.steps[this.results.steps.length - 1]) {
        this.results.steps[this.results.steps.length - 1].completed = true;
        this.results.steps[this.results.steps.length - 1].completedAt = new Date().toISOString();
        this.results.steps[this.results.steps.length - 1].finalUrl = this.page.url();
      }

    } catch (error) {
      console.error(`❌ Error in afterEachStep for step ${this.stepCount}:`, error.message);
      this.results.errors.push({
        step: this.stepCount,
        type: 'afterStep',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Called after all steps are executed
   */
  async afterAllSteps() {
    if (this.options.logSteps) {
      console.log('🎬 Chrome Recorder script execution completed');
    }

    // Take final screenshot
    if (this.options.takeStepScreenshots) {
      try {
        const screenshotPath = await takeScreenshot(this.page, this.options.outputDir, 'step-final');
        this.results.screenshots.push({
          step: this.stepCount + 1,
          type: 'final',
          path: screenshotPath,
          timestamp: new Date().toISOString(),
          url: this.page.url()
        });
      } catch (error) {
        console.error('❌ Error taking final screenshot:', error.message);
        this.results.errors.push({
          step: this.stepCount + 1,
          type: 'screenshot',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Final performance measurement
    if (this.options.measurePerformance) {
      try {
        const performance = await measurePerformance(this.page);
        this.results.performance.push({
          step: this.stepCount + 1,
          type: 'final',
          metrics: performance,
          timestamp: new Date().toISOString(),
          url: this.page.url()
        });
      } catch (error) {
        console.error('❌ Error measuring final performance:', error.message);
      }
    }

    this.results.endTime = Date.now();
    this.results.totalExecutionTime = this.results.endTime - this.results.startTime;
  }

  /**
   * Get all collected results
   */
  getResults() {
    return {
      ...this.results,
      summary: {
        totalSteps: this.stepCount,
        totalScreenshots: this.results.screenshots.length,
        totalPerformanceMeasurements: this.results.performance.length,
        totalErrors: this.results.errors.length,
        totalExecutionTimeMs: this.results.totalExecutionTime,
        totalExecutionTimeFormatted: `${this.results.totalExecutionTime}ms`
      }
    };
  }
}