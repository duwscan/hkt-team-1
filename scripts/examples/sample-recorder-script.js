/**
 * Sample Chrome Recorder script for testing
 * This is an example of what a Chrome Recorder export might look like
 */

export default async function run({ page }) {
  console.log('🎬 Running sample Chrome Recorder script...');
  
  try {
    // Example Chrome Recorder actions
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot after initial load
    console.log('📸 Taking initial page screenshot...');
    
    // Simulate some user interactions that Chrome Recorder might capture
    
    // Try to find and click a common element (e.g., search box, button)
    try {
      // Look for common search inputs
      const searchSelectors = ['input[type="search"]', 'input[name="q"]', 'input[placeholder*="search" i]', '#search'];
      let searchInput = null;
      
      for (const selector of searchSelectors) {
        try {
          searchInput = await page.$(selector);
          if (searchInput) {
            console.log(`✅ Found search input: ${selector}`);
            await searchInput.click();
            await page.type(selector, 'test search');
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!searchInput) {
        console.log('ℹ️ No search input found, trying other interactions...');
      }
    } catch (e) {
      console.log('ℹ️ Search interaction failed, continuing...');
    }
    
    // Try to find and interact with buttons
    try {
      const buttonSelectors = ['button', 'input[type="submit"]', 'input[type="button"]', '[role="button"]'];
      
      for (const selector of buttonSelectors) {
        try {
          const buttons = await page.$$(selector);
          if (buttons.length > 0) {
            // Click the first visible button
            const button = buttons[0];
            const isVisible = await button.isVisible();
            if (isVisible) {
              console.log(`✅ Found clickable button: ${selector}`);
              await button.click();
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    } catch (e) {
      console.log('ℹ️ Button interaction failed, continuing...');
    }
    
    // Wait a bit to simulate user behavior
    await page.waitForTimeout(2000);
    
    // Scroll down to simulate user browsing
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    
    await page.waitForTimeout(1000);
    
    // Try to interact with links
    try {
      const links = await page.$$('a');
      if (links.length > 0) {
        // Get the first few links and log them
        const linkTexts = await Promise.all(
          links.slice(0, 3).map(async (link) => {
            try {
              return await link.textContent();
            } catch (e) {
              return 'N/A';
            }
          })
        );
        console.log(`✅ Found ${links.length} links, first few: ${linkTexts.join(', ')}`);
      }
    } catch (e) {
      console.log('ℹ️ Link analysis failed, continuing...');
    }
    
    // Log some page information
    const title = await page.title();
    const url = page.url();
    
    console.log(`📄 Page Title: ${title}`);
    console.log(`🌐 Current URL: ${url}`);
    
    // Check for JavaScript errors by injecting a test script
    await page.evaluate(() => {
      console.log('Sample Chrome Recorder script executed successfully');
      console.log('Page load time:', performance.now());
      
      // Test if common web APIs are available
      if (typeof fetch !== 'undefined') {
        console.log('✅ Fetch API is available');
      }
      
      if (typeof localStorage !== 'undefined') {
        console.log('✅ localStorage is available');
      }
    });
    
    console.log('✅ Sample Chrome Recorder script completed successfully');
    
  } catch (error) {
    console.error('❌ Error in Chrome Recorder script:', error.message);
    throw error;
  }
}