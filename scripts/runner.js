#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { performance } from 'perf_hooks';
import puppeteer from 'puppeteer';
import { createRunner } from '@puppeteer/replay';
import { takeScreenshot } from './utils/screenshot.js';
import { ConsoleLogger } from './utils/console-logger.js';
import { measurePerformance } from './utils/performance.js';
import { ChromeRecorderExtension } from './utils/replay-extension.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure command line interface
program
  .name('chrome-recorder-runner')
  .description('Execute Chrome Recorder scripts with Puppeteer/Playwright')
  .version('1.0.0')
  .requiredOption('-s, --script <path>', 'Path to the Chrome Recorder JavaScript file')
  .requiredOption('-u, --url <url>', 'URL of the screen to test')
  .option('-o, --output <path>', 'Output directory for screenshots', './output')
  .option('--headless', 'Run in headless mode', false)
  .option('--timeout <ms>', 'Timeout in milliseconds', '30000')
  .option('--step-screenshots', 'Take screenshots after each step', false)
  .option('--log-file', 'Save detailed logs to file', true)
  .option('--slow-mo <ms>', 'Slow down operations by specified milliseconds', '5000')
  .option('--devtools', 'Open DevTools automatically', false)
  .option('--window-size <width>x<height>', 'Browser window size (e.g., 1920x1080)', '1920x1080')
  .option('--keep-open', 'Keep browser open after script completion', false)
  .option('--highlight-clicks', 'Highlight clicked elements for better visibility', true)
  .option('--pause-between-steps', 'Pause between steps for better visibility', true)
  .parse();

const options = program.opts();

/**
 * Save execution results to a log file
 * @param {object} result - Execution results object
 * @param {string} outputDir - Output directory path
 * @param {string} scriptName - Name of the executed script
 */
function saveLogToFile(result, outputDir, scriptName) {
  try {
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate log filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFilename = `${scriptName}_execution_${timestamp}.log`;
    const logPath = join(outputDir, logFilename);
    
    // Format the log content
    const logContent = `Chrome Recorder Execution Log
==========================================
Execution Date: ${new Date().toLocaleString()}
Script: ${result.scriptPath}
Target URL: ${result.url}
Final URL: ${result.currentUrl}

EXECUTION SUMMARY
=================
Screen Name: ${result.screenName}
Total Execution Time: ${result.performance.totalExecutionTime}
Total Steps Executed: ${result.execution.summary.totalSteps}
Total Screenshots: ${result.execution.summary.totalScreenshots}
Total Errors: ${result.execution.summary.totalErrors}

SCREENSHOTS
===========
Initial: ${result.screenshots.initial}
Final: ${result.screenshots.final}
Step Screenshots: ${result.execution.summary.totalScreenshots}

PERFORMANCE METRICS
===================
${JSON.stringify(result.performance.metrics, null, 2)}

STEP DETAILS
============
${result.execution.steps.map((step, index) => {
  const status = step.completed ? '✅ COMPLETED' : '❌ FAILED';
  return `${status} Step ${step.stepNumber}: ${step.type} at ${step.url || 'N/A'}`;
}).join('\n')}

CONSOLE LOGS
============
Total Logs: ${result.console.logs.length}
Errors: ${result.console.errorCount}
Warnings: ${result.console.warningCount}

${result.console.logs.map(log => {
  const timestamp = new Date(log.timestamp).toLocaleString();
  return `[${timestamp}] ${log.type.toUpperCase()}: ${log.text}`;
}).join('\n')}

EXECUTION ERRORS
================
${result.execution.errors.length > 0 ? 
  result.execution.errors.map(error => {
    const timestamp = new Date(error.timestamp).toLocaleString();
    return `[${timestamp}] Step ${error.step} (${error.type}): ${error.error}`;
  }).join('\n') : 
  'No execution errors occurred'
}

RAW DATA
========
${JSON.stringify(result, null, 2)}
`;
    
    // Write log file
    writeFileSync(logPath, logContent, 'utf8');
    console.log(`📝 Detailed log saved to: ${logPath}`);
    
    return logPath;
    
  } catch (error) {
    console.error('❌ Error saving log file:', error.message);
  }
}

/**
 * Save raw execution data as JSON file
 * @param {object} result - Execution results object
 * @param {string} outputDir - Output directory path
 * @param {string} scriptName - Name of the executed script
 */
function saveRawDataAsJson(result, outputDir, scriptName) {
  try {
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate JSON filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonFilename = `${scriptName}_data_${timestamp}.json`;
    const jsonPath = join(outputDir, jsonFilename);
    
    // Save raw data as formatted JSON
    const jsonContent = JSON.stringify(result, null, 2);
    writeFileSync(jsonPath, jsonContent, 'utf8');
    
    console.log(`📊 Raw data saved as JSON: ${jsonPath}`);
    return jsonPath;
    
  } catch (error) {
    console.error('❌ Error saving JSON file:', error.message);
  }
}

async function runScript() {
  const startTime = performance.now();
  let browser = null;
  let page = null;
  
  try {
    // Validate script file exists
    const scriptPath = resolve(options.script);
    if (!existsSync(scriptPath)) {
      throw new Error(`Script file not found: ${scriptPath}`);
    }

    console.log(`🚀 Starting Chrome Recorder script execution`);
    console.log(`📄 Script: ${scriptPath}`);
    console.log(`🌐 URL: ${options.url}`);
    
    // Parse window size from command line (this will be overridden by script if needed)
    const [width, height] = options.windowSize.split('x').map(Number);
    
    // Launch browser with cross-platform compatibility
    const browserOptions = {
      headless: options.headless === 'true' || options.headless === true,
      defaultViewport: null, // Don't set default viewport, let script control it
      slowMo: parseInt(options.slowMo) || 0,
      devtools: options.devtools === 'true' || options.devtools === true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--window-position=0,0'
      ]
    };
    
    // Force headless to false if not explicitly set to true
    if (options.headless !== 'true' && options.headless !== true) {
      browserOptions.headless = false;
      console.log('🔍 Browser will run in VISIBLE mode (not headless)');
    } else {
      console.log('👻 Browser will run in HEADLESS mode');
    }
    
    console.log(`🌐 Launching Chrome with bundled Chromium (cross-platform)`);
    console.log(`📱 Initial Window Size: ${width}x${height} (will be overridden by script)`);
    console.log(`🐌 Slow Motion: ${options.slowMo}ms`);
    console.log(`🔧 DevTools: ${options.devtools ? 'Enabled' : 'Disabled'}`);
    
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    
    // Don't set viewport here - let the script control it
    console.log('📐 Viewport will be set by Chrome Recorder script');
    
    // Add click highlighting if enabled
    if (options.highlightClicks !== 'false' && options.highlightClicks !== false) {
      await page.evaluateOnNewDocument(() => {
        // Highlight elements when they're clicked
        document.addEventListener('click', function(e) {
          const element = e.target;
          const originalBackground = element.style.backgroundColor;
          const originalBorder = element.style.border;
          
          // Highlight the clicked element
          element.style.backgroundColor = '#ffeb3b';
          element.style.border = '3px solid #ff5722';
          
          // Remove highlight after 2 seconds
          setTimeout(() => {
            element.style.backgroundColor = originalBackground;
            element.style.border = originalBorder;
          }, 2000);
        });
      });
      console.log('🎯 Click highlighting enabled - elements will be highlighted when clicked');
    }
    
    // Add step-by-step pausing if enabled
    if (options.pauseBetweenSteps !== 'false' && options.pauseBetweenSteps !== false) {
      await page.evaluateOnNewDocument(() => {
        // Add visual indicator for current step
        window.currentStep = 0;
        window.showStepIndicator = function(stepNumber, description) {
          // Remove existing indicator
          const existing = document.getElementById('step-indicator');
          if (existing) existing.remove();
          
          // Create new step indicator
          const indicator = document.createElement('div');
          indicator.id = 'step-indicator';
          indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            min-width: 200px;
          `;
          indicator.innerHTML = `
            <div>🚀 Step ${stepNumber}</div>
            <div style="font-size: 14px; margin-top: 5px;">${description}</div>
          `;
          document.body.appendChild(indicator);
          
          // Auto-remove after 3 seconds
          setTimeout(() => {
            if (indicator.parentNode) {
              indicator.parentNode.removeChild(indicator);
            }
          }, 3000);
        };
      });
      console.log('⏸️ Step pausing enabled - you will see step indicators');
    }
    
    // Initialize console logger
    const consoleLogger = new ConsoleLogger();
    consoleLogger.attach(page);
    
    // Set timeout
    page.setDefaultTimeout(parseInt(options.timeout));
    
    // Navigate to the URL
    console.log(`📍 Navigating to: ${options.url}`);
    await page.goto(options.url, { waitUntil: 'networkidle0' });
    
    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take initial screenshot
    const initialScreenshotPath = await takeScreenshot(page, options.output, 'initial');
    
    // Create custom extension for Chrome Recorder
    const extension = new ChromeRecorderExtension(page, {
      outputDir: options.output,
      takeStepScreenshots: options.stepScreenshots !== 'false' && options.stepScreenshots !== false,
      logSteps: true,
      measurePerformance: true
    });
    
    console.log(`⚡ Executing Chrome Recorder script...`);
    
    try {
      // Import and execute the Chrome Recorder script
      const scriptModule = await import(`file://${scriptPath}`);
      
      // Check if it's a Chrome Recorder script with run function
      if (typeof scriptModule.run === 'function') {
        console.log('📝 Detected Chrome Recorder format script');
        console.log('🚀 Starting script execution with detailed step logging...');
        
        // Call extension before all steps
        await extension.beforeAllSteps();
        
        // Execute the script with better error handling and pass page object
        await scriptModule.run(extension, page);
        
        // Call extension after all steps
        await extension.afterAllSteps();
        
        console.log('✅ Script execution completed successfully');
      } else if (typeof scriptModule.default === 'function') {
        console.log('📝 Detected script with default export');
        await extension.beforeAllSteps();
        await scriptModule.default(extension, page);
        await extension.afterAllSteps();
      } else {
        // Fallback: try to execute as raw script
        console.log('📝 Attempting to execute as raw script...');
        const fs = await import('fs');
        const scriptContent = fs.readFileSync(scriptPath, 'utf8');
        await page.evaluate(scriptContent);
      }
    } catch (scriptError) {
      console.error('❌ Error during script execution:', scriptError.message);
      console.log('🔍 Attempting to continue with final screenshot...');
    }
    
    // Take final screenshot
    const finalScreenshotPath = await takeScreenshot(page, options.output, 'final');
    
    // Get results from extension
    const extensionResults = extension.getResults();
    
    // Measure performance
    const performanceMetrics = await measurePerformance(page);
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Get console logs
    const consoleLogs = consoleLogger.getLogs();
    
    // Get current URL
    const currentUrl = page.url();
    
    // Prepare comprehensive output
    const result = {
      screenName: basename(options.url),
      url: options.url,
      currentUrl: currentUrl,
      scriptPath: scriptPath,
      screenshots: {
        initial: initialScreenshotPath,
        final: finalScreenshotPath,
        steps: extensionResults.screenshots
      },
      performance: {
        totalExecutionTime: `${totalTime.toFixed(2)}ms`,
        scriptSteps: extensionResults.summary,
        metrics: performanceMetrics,
        stepPerformance: extensionResults.performance
      },
      console: {
        logs: consoleLogs,
        errorCount: consoleLogs.filter(log => log.type === 'error').length,
        warningCount: consoleLogs.filter(log => log.type === 'warning').length
      },
      execution: {
        steps: extensionResults.steps,
        errors: extensionResults.errors,
        summary: extensionResults.summary
      },
      timestamp: new Date().toISOString()
    };
    
    // Get script name for file naming
    const scriptName = basename(options.script, '.js');
    
    // Save detailed log to file if enabled
    if (options.logFile !== 'false' && options.logFile !== false) {
      saveLogToFile(result, options.output, scriptName);
    }

    // Save raw data as JSON file
    saveRawDataAsJson(result, options.output, scriptName);
    
    // Output results
    console.log('\n📊 Execution Results:');
    console.log('='.repeat(50));
    console.log(`Screen Name: ${result.screenName}`);
    console.log(`Final URL: ${result.currentUrl}`);
    console.log(`Total Execution Time: ${result.performance.totalExecutionTime}`);
    console.log(`Total Steps Executed: ${result.execution.summary.totalSteps}`);
    console.log(`Screenshots:`);
    console.log(`  - Initial: ${result.screenshots.initial}`);
    console.log(`  - Final: ${result.screenshots.final}`);
    console.log(`  - Step Screenshots: ${result.execution.summary.totalScreenshots}`);
    console.log(`Console Logs: ${result.console.logs.length} total, ${result.console.errorCount} errors, ${result.console.warningCount} warnings`);
    console.log(`Execution Errors: ${result.execution.summary.totalErrors}`);
    
    if (result.console.logs.length > 0) {
      console.log('\n📝 Console Output:');
      result.console.logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        console.log(`[${timestamp}] ${log.type.toUpperCase()}: ${log.text}`);
      });
    }
    
    if (result.execution.errors.length > 0) {
      console.log('\n⚠️ Execution Errors:');
      result.execution.errors.forEach(error => {
        const timestamp = new Date(error.timestamp).toLocaleTimeString();
        console.log(`[${timestamp}] Step ${error.step} (${error.type}): ${error.error}`);
      });
    }
    
    // Step-by-step summary
    console.log('\n📋 Step Summary:');
    result.execution.steps.forEach((step, index) => {
      const status = step.completed ? '✅' : '❌';
      console.log(`${status} Step ${step.stepNumber}: ${step.type} at ${step.url || 'N/A'}`);
    });
    
    // Return structured data for potential API integration
    return result;
    
  } catch (error) {
    console.error('❌ Error executing script:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runScript()
    .then(result => {
      console.log('\n✅ Script execution completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script execution failed:', error.message);
      process.exit(1);
    });
}

export { runScript };