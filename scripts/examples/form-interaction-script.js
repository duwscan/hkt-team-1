/**
 * Another sample Chrome Recorder script - Simple form interaction
 * This demonstrates a typical Chrome Recorder export for form testing
 */

export default async function run({ page }) {
  console.log('📝 Running form interaction Chrome Recorder script...');
  
  try {
    // Wait for page to be ready
    await page.waitForLoadState('domcontentloaded');
    
    // Look for form elements
    const forms = await page.$$('form');
    console.log(`📋 Found ${forms.length} forms on the page`);
    
    if (forms.length > 0) {
      const form = forms[0];
      
      // Look for input fields in the first form
      const inputs = await form.$$('input');
      console.log(`📝 Found ${inputs.length} input fields in first form`);
      
      for (let i = 0; i < Math.min(inputs.length, 3); i++) {
        try {
          const input = inputs[i];
          const type = await input.getAttribute('type');
          const name = await input.getAttribute('name');
          const placeholder = await input.getAttribute('placeholder');
          
          console.log(`📝 Input ${i + 1}: type=${type}, name=${name}, placeholder=${placeholder}`);
          
          if (type === 'text' || type === 'email' || !type) {
            await input.click();
            await input.fill(`test-value-${i + 1}`);
            console.log(`✏️ Filled input ${i + 1} with test value`);
          }
          
          await page.waitForTimeout(500); // Small delay between actions
          
        } catch (e) {
          console.log(`⚠️ Could not interact with input ${i + 1}: ${e.message}`);
        }
      }
      
      // Look for submit button
      try {
        const submitButton = await form.$('input[type="submit"], button[type="submit"], button');
        if (submitButton) {
          const buttonText = await submitButton.textContent();
          console.log(`🔘 Found submit button: "${buttonText}"`);
          
          // Don't actually submit to avoid navigation
          console.log('ℹ️ Skipping form submission to avoid navigation');
        }
      } catch (e) {
        console.log('ℹ️ No submit button found');
      }
    }
    
    // Test some browser APIs
    await page.evaluate(() => {
      console.log('🧪 Testing browser APIs...');
      
      // Test if we can access common APIs
      const apis = [
        'localStorage',
        'sessionStorage',
        'fetch',
        'navigator',
        'document',
        'window'
      ];
      
      apis.forEach(api => {
        if (typeof window[api] !== 'undefined') {
          console.log(`✅ ${api} API is available`);
        } else {
          console.log(`❌ ${api} API is not available`);
        }
      });
      
      // Test console methods
      console.log('This is a test log message');
      console.warn('This is a test warning message');
      console.info('This is a test info message');
    });
    
    // Simulate some scrolling behavior
    console.log('🔄 Simulating scroll behavior...');
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    console.log('✅ Form interaction script completed successfully');
    
  } catch (error) {
    console.error('❌ Error in form interaction script:', error.message);
    throw error;
  }
}