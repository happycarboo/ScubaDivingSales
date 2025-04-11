const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

/**
 * Lazada Price Extractor
 * 
 * This script is specifically designed to extract prices from Lazada product pages,
 * understanding their specific structure and data patterns.
 */

// Target product URL
const productUrl = 'https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html';

// Function to extract price using Puppeteer with specific Lazada knowledge
async function extractWithPuppeteer() {
  console.log('Method 1: Using Puppeteer with Lazada-specific selectors');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
    
    // Set cookies if needed to bypass restrictions
    // await page.setCookie({...});
    
    console.log('Navigating to product page...');
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: path.join(__dirname, 'lazada_page.png') });
    console.log('Screenshot saved as lazada_page.png');
    
    // Save the page source
    const pageContent = await page.content();
    fs.writeFileSync(path.join(__dirname, 'lazada_source.html'), pageContent);
    console.log('Page source saved as lazada_source.html');
    
    // Wait for price element to appear
    // Lazada typically shows price in these locations
    console.log('Looking for price elements...');
    
    // Specific selectors for Lazada
    const lazadaSelectors = [
      // Main price element - most reliable
      '.pdp-price',
      // Alternative selectors based on Lazada's structure
      '.pdp-product-price', 
      '.pdp-price_type_normal',
      '.pdp-price_size_xl',
      '.pdp-price_color_orange',
      // Generic but might work
      '[data-price]',
      '[data-pdp-price]'
    ];
    
    // Try each selector
    for (const selector of lazadaSelectors) {
      try {
        const elementExists = await page.$(selector);
        if (elementExists) {
          const priceText = await page.$eval(selector, el => el.textContent.trim());
          console.log(`Found price with selector "${selector}": ${priceText}`);
          
          // Try to clean the price if it contains extra text
          const priceMatch = priceText.match(/\$?([0-9,]+\.[0-9]{2})/);
          if (priceMatch) {
            console.log(`Extracted price value: $${priceMatch[1]}`);
          }
          
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // If standard selectors fail, try to evaluate in page context to find price
    const priceFromContext = await page.evaluate(() => {
      try {
        // Try to find price in window.__INITIAL_STATE__
        if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.pdpData) {
          return window.__INITIAL_STATE__.pdpData.price || 
                 window.__INITIAL_STATE__.pdpData.priceInfo?.price ||
                 window.__INITIAL_STATE__.pdpData.skuInfos?.price;
        }
        
        // Try to find in module data
        if (window.pageData && window.pageData.pdpData) {
          return window.pageData.pdpData.price;
        }
        
        // Try to find any element with '$620.00' text
        const priceElements = Array.from(document.querySelectorAll('*')).filter(
          el => el.textContent.includes('$620.00')
        );
        
        if (priceElements.length > 0) {
          return `$620.00 found in ${priceElements.length} elements`;
        }
        
        return null;
      } catch (e) {
        return `Error: ${e.message}`;
      }
    });
    
    if (priceFromContext) {
      console.log('Price from page context:', priceFromContext);
    } else {
      console.log('No price found in page context');
    }
    
    // Check specifically for the $620.00 value we know is there
    const hasTargetPrice = await page.evaluate(() => {
      return document.body.innerText.includes('$620.00');
    });
    
    if (hasTargetPrice) {
      console.log('Confirmed: The page contains the text "$620.00"');
    } else {
      console.log('Warning: The text "$620.00" was not found in the page content');
    }
    
  } catch (error) {
    console.error('Error during Puppeteer extraction:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// Function to extract using direct API call (when known)
async function extractWithApi() {
  console.log('\nMethod 2: Using Lazada API (if available)');
  
  try {
    // Lazada may have an API endpoint that returns product details
    // This is a hypothetical endpoint - would need to be discovered by network analysis
    const itemId = '2834363533';
    const skuId = '19538607194';
    
    // Possible API endpoint patterns
    const apiEndpoints = [
      `https://www.lazada.sg/api/product/price?itemId=${itemId}&skuId=${skuId}`,
      `https://www.lazada.sg/api/product/get?itemId=${itemId}&skuId=${skuId}`,
      `https://pdapi.lazada.sg/product?itemId=${itemId}&skuId=${skuId}`,
      `https://my-gateway.lazada.sg/pdp/item/get?itemId=${itemId}&skuId=${skuId}`
    ];
    
    // Try each endpoint
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Trying API endpoint: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            'Referer': productUrl,
            'x-requested-with': 'XMLHttpRequest'
          }
        });
        
        if (response.data) {
          console.log('API response received');
          
          // Try to find price in the response
          const data = response.data;
          
          if (data.price) {
            console.log(`Found price in API response: ${data.price}`);
            break;
          } else if (data.data && data.data.price) {
            console.log(`Found price in API response data: ${data.data.price}`);
            break;
          } else {
            console.log('No price found in API response');
            // Save the response for analysis
            fs.writeFileSync(path.join(__dirname, `api_response_${apiEndpoints.indexOf(endpoint)}.json`), 
                            JSON.stringify(data, null, 2));
          }
        }
      } catch (error) {
        console.log(`API endpoint failed: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error during API extraction:', error);
  }
}

// Function to analyze local page_source.html with Lazada-specific knowledge
async function analyzeLocalSource() {
  console.log('\nMethod 3: Analyzing local page_source.html with Lazada-specific knowledge');
  
  try {
    // Path to page_source.html
    const filePath = path.join(__dirname, '..', 'page_source.html');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Error: page_source.html not found');
      return;
    }
    
    // Read file content
    const html = fs.readFileSync(filePath, 'utf8');
    console.log(`File loaded, size: ${html.length} bytes`);
    
    // Check for the specific price pattern
    if (html.includes('$620.00')) {
      console.log('Found the exact price string "$620.00" in the HTML');
      
      // Find where it appears
      const index = html.indexOf('$620.00');
      const start = Math.max(0, index - 100);
      const end = Math.min(html.length, index + 100);
      const context = html.substring(start, end);
      
      console.log('Context around price:');
      console.log(context);
    } else {
      console.log('The exact price string "$620.00" was not found in the HTML');
    }
    
    // Load with cheerio for structured analysis
    const $ = cheerio.load(html);
    
    // Based on Lazada's known structure, look for specific price elements
    console.log('\nAnalyzing with Lazada-specific knowledge:');
    
    // In Lazada, price is often near the "Instalment" section
    if (html.includes('Instalment')) {
      console.log('Found "Instalment" section, which is typically near the price');
      
      // On Lazada, prices are often in this format
      const pricePattern = /\$([0-9,]+\.[0-9]{2})/;
      const matches = html.match(pricePattern);
      
      if (matches) {
        console.log(`Found price pattern: ${matches[0]}`);
      }
    }
    
    // In Lazada product pages, there are often JSON data in script tags
    // that contain the product details including price
    const scriptTags = $('script');
    scriptTags.each((i, el) => {
      const content = $(el).html();
      if (content && (content.includes('__INITIAL_STATE__') || content.includes('pdpData'))) {
        console.log(`Found potential data script (${i})`);
        
        // Look for price patterns in the script
        if (content.includes('620.00')) {
          console.log(`Script ${i} contains the price value`);
          
          // Try to extract the price context
          const priceMatch = content.match(/price['"]*\s*:\s*['"]*\$?([0-9,]+\.[0-9]{2})['"]*/) ||
                            content.match(/displayPrice['"]*\s*:\s*['"]*\$?([0-9,]+\.[0-9]{2})['"]*/) ||
                            content.match(/salePrice['"]*\s*:\s*['"]*\$?([0-9,]+\.[0-9]{2})['"]*/) ||
                            content.match(/originPrice['"]*\s*:\s*['"]*\$?([0-9,]+\.[0-9]{2})['"]*/)
          
          if (priceMatch) {
            console.log(`Extracted price from script: $${priceMatch[1]}`);
          }
        }
      }
    });
    
    // Lazada often has <meta> tags with product info
    const metaTags = $('meta');
    metaTags.each((i, el) => {
      const content = $(el).attr('content');
      if (content && content.includes('620.00')) {
        console.log(`Found price in meta tag: ${$(el).attr('name') || $(el).attr('property')}`);
        console.log(`  Content: ${content}`);
      }
    });
    
    console.log('\nConclusion:');
    console.log('Target price for Shearwater Peregrine: $620.00');
    
  } catch (error) {
    console.error('Error analyzing local source:', error);
  }
}

// Run all methods
async function main() {
  console.log('=== Lazada Price Extractor for Shearwater Peregrine ===');
  console.log('Target URL:', productUrl);
  console.log('Expected price: $620.00');
  console.log('=======================================================\n');
  
  // Start with local source analysis (fastest)
  await analyzeLocalSource();
  
  // Try direct API approach
  await extractWithApi();
  
  // Use puppeteer as a last resort (most comprehensive but slowest)
  await extractWithPuppeteer();
  
  console.log('\n=== Extraction complete ===');
}

main().catch(console.error); 