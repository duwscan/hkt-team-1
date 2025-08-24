import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Takes a full page screenshot and saves it to the specified output directory
 * @param {object} page - Puppeteer page object
 * @param {string} outputDir - Output directory path
 * @param {string} prefix - Filename prefix (e.g., 'initial', 'final', 'step-1')
 * @returns {string} - Path to the saved screenshot
 */
export async function takeScreenshot(page, outputDir = './output', prefix = 'screenshot') {
  try {
    // Ensure output directory exists
    const resolvedOutputDir = resolve(outputDir);
    if (!existsSync(resolvedOutputDir)) {
      mkdirSync(resolvedOutputDir, { recursive: true });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}_${timestamp}.png`;
    const filePath = join(resolvedOutputDir, filename);
    
    // Take full page screenshot
    await page.screenshot({
      path: filePath,
      fullPage: true,
      quality: 90,
      type: 'png'
    });
    
    console.log(`📸 Screenshot saved: ${filePath}`);
    return filePath;
    
  } catch (error) {
    console.error('❌ Error taking screenshot:', error.message);
    throw error;
  }
}

/**
 * Takes a screenshot of a specific element
 * @param {object} page - Puppeteer page object
 * @param {string} selector - CSS selector of the element
 * @param {string} outputDir - Output directory path
 * @param {string} prefix - Filename prefix
 * @returns {string} - Path to the saved screenshot
 */
export async function takeElementScreenshot(page, selector, outputDir = './output', prefix = 'element') {
  try {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    // Ensure output directory exists
    const resolvedOutputDir = resolve(outputDir);
    if (!existsSync(resolvedOutputDir)) {
      mkdirSync(resolvedOutputDir, { recursive: true });
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${prefix}_${timestamp}.png`;
    const filePath = join(resolvedOutputDir, filename);
    
    // Take element screenshot
    await element.screenshot({
      path: filePath,
      quality: 90,
      type: 'png'
    });
    
    console.log(`📸 Element screenshot saved: ${filePath}`);
    return filePath;
    
  } catch (error) {
    console.error('❌ Error taking element screenshot:', error.message);
    throw error;
  }
}