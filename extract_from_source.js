const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

/**
 * Script to extract the price from page_source.html
 * This file is specifically focused on analyzing the provided page source
 */

async function extractPriceFromPageSource() {
  try {
    // Path to page_source.html
    const filePath = path.join(__dirname, '..', 'page_source.html');
    
    console.log('Reading page_source.html...');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Error: page_source.html not found at', filePath);
      return;
    }
    
    // Read file content
    const html = fs.readFileSync(filePath, 'utf8');
    console.log(`File loaded, size: ${html.length} bytes`);
    
    // Method 1: Direct string search for the known price
    if (html.includes('$620.00')) {
      console.log('Method 1 (Direct String): Price $620.00 found in the HTML');
    } else {
      console.log('Method 1 (Direct String): Price $620.00 not found in the HTML');
    }
    
    // Method 2: Parse HTML with Cheerio
    const $ = cheerio.load(html);
    
    // Method 2.1: Try different CSS selectors that might contain the price
    const selectors = [
      '[data-price]',
      '[data-pdp-price]',
      '.pdp-price',
      '.pdp-price_size_xl',
      '[class*="price"]',
      '[class*="Price"]',
      '[class*="productPrice"]',
      '[itemtype="http://schema.org/Offer"] [itemprop="price"]',
      'div:contains("$620.00")'
    ];
    
    let found = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Method 2.1 (Cheerio Selector): Found ${elements.length} elements with selector "${selector}"`);
        
        elements.each((i, el) => {
          const text = $(el).text().trim();
          if (text.includes('$') || text.includes('620')) {
            console.log(`  Element ${i}: "${text}"`);
            found = true;
          }
        });
      }
    }
    
    if (!found) {
      console.log('Method 2.1 (Cheerio Selector): No price elements found');
    }
    
    // Method 2.2: Look for prices in any element
    const priceRegex = /\$([0-9,]+\.[0-9]{2})/g;
    const bodyText = $('body').text();
    const priceMatches = bodyText.match(priceRegex);
    
    if (priceMatches) {
      console.log('Method 2.2 (Body Text): Found prices:', priceMatches);
    } else {
      console.log('Method 2.2 (Body Text): No prices found in body text');
    }
    
    // Method 3: Search for price in script tags
    const scriptTags = $('script');
    console.log(`Method 3 (Scripts): Searching ${scriptTags.length} script tags...`);
    
    let scriptFound = false;
    scriptTags.each((i, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && scriptContent.includes('620.00')) {
        console.log(`Method 3 (Scripts): Found price in script tag ${i}`);
        
        // Try to find the price in a JSON structure
        const priceJsonRegex = /"price":\s*"?\$?([0-9,]+\.[0-9]{2})"?/;
        const priceMatch = scriptContent.match(priceJsonRegex);
        
        if (priceMatch) {
          console.log(`  Found JSON price: ${priceMatch[0]}`);
          scriptFound = true;
        } else {
          // Just extract a snippet around the price
          const index = scriptContent.indexOf('620.00');
          const start = Math.max(0, index - 30);
          const end = Math.min(scriptContent.length, index + 30);
          console.log(`  Context: ...${scriptContent.substring(start, end)}...`);
          scriptFound = true;
        }
      }
    });
    
    if (!scriptFound) {
      console.log('Method 3 (Scripts): No price found in script tags');
    }
    
    // Method 4: Extract using key elements around the price
    // Based on the screenshot, we know the price is $620.00 with specific structural context
    console.log('\nMethod 4 (Structure Analysis): Analyzing page structure...');
    
    // Look for page elements and their context
    const elements = $('*:contains("$620.00")');
    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements containing "$620.00"`);
      
      elements.each((i, el) => {
        const elementHtml = $(el).html();
        if (elementHtml && elementHtml.length < 100) { // Avoid printing huge blocks
          console.log(`  Element ${i} HTML: ${elementHtml}`);
        }
        
        // Check parent elements for context
        const parent = $(el).parent();
        const parentClass = parent.attr('class');
        if (parentClass) {
          console.log(`  Parent class: ${parentClass}`);
        }
      });
    }
    
    // Method 5: Extract using specific JSON data in the page
    // Search for "__INITIAL_STATE__" which might contain product details
    let stateFound = false;
    $('script').each((i, el) => {
      const content = $(el).html();
      if (content && content.includes('__INITIAL_STATE__')) {
        console.log('Method 5 (JS State): Found __INITIAL_STATE__ in script tag');
        stateFound = true;
        
        // Try to extract the product data portion
        const productDataMatch = content.match(/productData['"]*:\s*({.*?})/s);
        if (productDataMatch) {
          console.log('  Found productData section');
          
          // Look for price in this section
          const priceMatch = productDataMatch[1].match(/price['"]*:\s*['"]?\$?([0-9,]+\.[0-9]{2})['"]?/);
          if (priceMatch) {
            console.log(`  Price found: $${priceMatch[1]}`);
          }
        }
      }
    });
    
    if (!stateFound) {
      console.log('Method 5 (JS State): No state data found');
    }
    
    console.log('\nAdditional Analysis:');
    
    // Check if we can find the key segment where the price should be
    const installmentSection = $('*:contains("Instalment")');
    if (installmentSection.length > 0) {
      console.log('Found Instalment section, which is near the price in the UI');
      
      // Look at nearby elements
      const siblings = installmentSection.parent().children();
      siblings.each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.includes('$')) {
          console.log(`  Nearby element ${i}: "${text}"`);
        }
      });
    }
    
    console.log('\nConclusion:');
    console.log('Expected price: $620.00');
    
  } catch (error) {
    console.error('Error extracting price:', error);
  }
}

// Run the extraction
extractPriceFromPageSource().catch(console.error); 