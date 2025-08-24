#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename } from 'path';
import { existsSync } from 'fs';
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
  .option('--headless', 'Run in headless mode', true)
  .option('--timeout <ms>', 'Timeout in milliseconds', '30000')
  .option('--step-screenshots', 'Take screenshots after each step', true)
  .parse();

const options = program.opts();

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
    
    // Launch browser with cross-platform compatibility
    const browserOptions = {
      headless: options.headless === 'true' || options.headless === true,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    console.log(`🌐 Launching Chrome with bundled Chromium (cross-platform)`);
    browser = await puppeteer.launch(browserOptions);
    page = await browser.newPage();
    
    // Initialize console logger
    const consoleLogger = new ConsoleLogger();
    consoleLogger.attach(page);
    
    // Set timeout
    page.setDefaultTimeout(parseInt(options.timeout));
    
    // Navigate to the URL
    console.log(`📍 Navigating to: ${options.url}`);
    await page.goto(options.url, { waitUntil: 'networkidle0' });
    
    // Take initial screenshot
    const initialScreenshotPath = await takeScreenshot(page, options.output, 'initial');
    
    // Create custom extension for Chrome Recorder
    const extension = new ChromeRecorderExtension(page, {
      outputDir: options.output,
      takeStepScreenshots: options.stepScreenshots !== 'false' && options.stepScreenshots !== false,
      logSteps: true,
      measurePerformance: true
    });
    
    // Create Puppeteer Replay runner with our custom extension
    const runner = await createRunner(extension);
    
    console.log(`⚡ Executing Chrome Recorder script...`);
    
    // Import and execute the Chrome Recorder script
    const scriptModule = await import(`file://${scriptPath}`);
    
    // Check if it's a Chrome Recorder script with run function
    if (typeof scriptModule.run === 'function') {
      console.log('📝 Detected Chrome Recorder format script');
      await scriptModule.run(extension);
    } else if (typeof scriptModule.default === 'function') {
      console.log('📝 Detected script with default export');
      await scriptModule.default(extension);
    } else {
      // Fallback: try to execute as raw script
      console.log('📝 Attempting to execute as raw script...');
      const fs = await import('fs');
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      await page.evaluate(scriptContent);
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