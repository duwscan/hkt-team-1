#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename } from 'path';
import { existsSync } from 'fs';
import { performance } from 'perf_hooks';
import puppeteer from 'puppeteer-core';
import { takeScreenshot } from './utils/screenshot.js';
import { ConsoleLogger } from './utils/console-logger.js';
import { measurePerformance } from './utils/performance.js';

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
    
    // Launch browser
    const browserOptions = {
      headless: options.headless === 'true' || options.headless === true,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    // Try to find Chrome/Chromium executable
    const possiblePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
      process.env.CHROME_EXECUTABLE_PATH
    ].filter(Boolean);
    
    for (const executablePath of possiblePaths) {
      try {
        const fs = await import('fs');
        if (fs.existsSync(executablePath)) {
          browserOptions.executablePath = executablePath;
          console.log(`🌐 Using Chrome at: ${executablePath}`);
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }
    
    if (!browserOptions.executablePath) {
      console.log('⚠️ Chrome executable not found, trying without explicit path...');
    }
    
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
    
    // Import and execute the Chrome Recorder script
    console.log(`⚡ Executing Chrome Recorder script...`);
    
    // Dynamic import of the script
    const scriptModule = await import(`file://${scriptPath}`);
    
    // Most Chrome Recorder scripts export a default function or have a run function
    let runFunction = scriptModule.default || scriptModule.run || scriptModule;
    
    if (typeof runFunction === 'function') {
      await runFunction({ page, browser });
    } else {
      // If it's not a function, try to execute it as a script
      console.log('Script is not a function, attempting to evaluate...');
      const fs = await import('fs');
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      await page.evaluate(scriptContent);
    }
    
    // Take final screenshot
    const finalScreenshotPath = await takeScreenshot(page, options.output, 'final');
    
    // Measure performance
    const performanceMetrics = await measurePerformance(page);
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    // Get console logs
    const consoleLogs = consoleLogger.getLogs();
    
    // Get current URL
    const currentUrl = page.url();
    
    // Prepare output
    const result = {
      screenName: basename(options.url),
      url: options.url,
      currentUrl: currentUrl,
      scriptPath: scriptPath,
      screenshots: {
        initial: initialScreenshotPath,
        final: finalScreenshotPath
      },
      performance: {
        totalExecutionTime: `${totalTime.toFixed(2)}ms`,
        ...performanceMetrics
      },
      console: {
        logs: consoleLogs,
        errorCount: consoleLogs.filter(log => log.type === 'error').length,
        warningCount: consoleLogs.filter(log => log.type === 'warning').length
      },
      timestamp: new Date().toISOString()
    };
    
    // Output results
    console.log('\n📊 Execution Results:');
    console.log('='.repeat(50));
    console.log(`Screen Name: ${result.screenName}`);
    console.log(`Final URL: ${result.currentUrl}`);
    console.log(`Total Execution Time: ${result.performance.totalExecutionTime}`);
    console.log(`Screenshots:`);
    console.log(`  - Initial: ${result.screenshots.initial}`);
    console.log(`  - Final: ${result.screenshots.final}`);
    console.log(`Console Logs: ${result.console.logs.length} total, ${result.console.errorCount} errors, ${result.console.warningCount} warnings`);
    
    if (result.console.logs.length > 0) {
      console.log('\n📝 Console Output:');
      result.console.logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        console.log(`[${timestamp}] ${log.type.toUpperCase()}: ${log.text}`);
      });
    }
    
    // Return structured data for potential API integration
    return result;
    
  } catch (error) {
    console.error('❌ Error executing script:', error.message);
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