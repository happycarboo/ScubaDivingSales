const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// URL for the Dive Box stainless steel shaker product on Lazada
const productUrl = 'https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html';

// Function to fetch price using axios
async function fetchPriceWithAxios() {
  try {
    console.log('Method 1 (Axios): Fetching page...');
    
    // Set headers to mimic a browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.lazada.sg/'
    };
    
    const response = await axios.get(productUrl, { headers });
    const html = response.data;
    
    // Save the response to a file for debugging
    fs.writeFileSync(path.join(__dirname, 'response.html'), html);
    console.log('Method 1 (Axios): Page saved to response.html');
    
    // Method 1.1: Using regex to extract price
    const priceRegex = /\$([0-9,]+\.[0-9]{2})/g;
    const match = html.match(priceRegex);
    
    if (match) {
      console.log('Method 1.1 (Axios + Regex): Price found:', match[0]);
    } else {
      console.log('Method 1.1 (Axios + Regex): Price not found');
    }
    
    // Method 1.2: Using Cheerio to parse HTML
    const $ = cheerio.load(html);
    
    // Try different selectors that might contain the price
    const selectors = [
      '[data-price]',
      '[data-pdp-price]',
      '.pdp-price',
      '.pdp-price_size_xl',
      '[class*="price"]',
      '[class*="Price"]',
      '[class*="productPrice"]',
      '[itemtype="http://schema.org/Offer"] [itemprop="price"]'
    ];
    
    for (const selector of selectors) {
      const priceElement = $(selector);
      if (priceElement.length > 0) {
        const price = priceElement.text().trim();
        console.log(`Method 1.2 (Axios + Cheerio): Price found with selector "${selector}":`, price);
        break;
      }
    }
    
    // Method 1.3: Look for JSON data in script tags
    const scriptTags = $('script[type="application/ld+json"]');
    let foundPrice = null;
    
    scriptTags.each((i, el) => {
      try {
        const jsonData = JSON.parse($(el).html());
        if (jsonData.offers && jsonData.offers.price) {
          console.log('Method 1.3 (Axios + JSON-LD): Price found:', jsonData.offers.price);
          foundPrice = jsonData.offers.price;
          return false; // Break the loop
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });
    
    // Method 1.4: Try to find price in any script containing JSON
    if (!foundPrice) {
      const allScripts = $('script');
      allScripts.each((i, el) => {
        const scriptContent = $(el).html();
        if (scriptContent.includes('"price"')) {
          try {
            // Extract price using regex
            const priceMatch = scriptContent.match(/"price":\s*"?\$?([0-9,]+\.[0-9]{2})"?/);
            if (priceMatch && priceMatch[1]) {
              console.log('Method 1.4 (Axios + Script JSON): Price found:', priceMatch[1]);
              return false; // Break the loop
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });
    }

    // Method 1.5: Direct string search
    if (html.includes('$620.00')) {
      console.log('Method 1.5 (Axios + Direct String): Price $620.00 found in the HTML');
    }
    
    // Extract data from JavaScript variables
    const dataMatch = html.match(/data:({.*?}),\s*error:/s);
    if (dataMatch && dataMatch[1]) {
      try {
        const dataObject = eval(`(${dataMatch[1]})`);
        if (dataObject && dataObject.root && dataObject.root.fields && dataObject.root.fields.price) {
          console.log('Method 1.6 (Axios + JS Variables): Price found:', dataObject.root.fields.price);
        }
      } catch (e) {
        console.log('Method 1.6: Error parsing JS data:', e.message);
      }
    }
    
    console.log('Method 1 (Axios): Completed');
    
  } catch (error) {
    console.error('Method 1 (Axios) Error:', error.message);
  }
}

// Function to handle API approach
async function fetchPriceWithApi() {
  try {
    console.log('\nMethod 2 (API): Trying to fetch price from API...');
    
    // Some sites have APIs that can be used to get the price directly
    // Typically, you'd need to analyze the network requests when loading the page to find these
    
    // Example API endpoint - this is hypothetical and would need to be replaced with the actual API
    const apiUrl = `https://www.lazada.sg/api/product/get?itemId=2712954458&skuId=18273448333`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      'Accept': 'application/json',
      'Referer': productUrl
    };
    
    const response = await axios.get(apiUrl, { headers });
    
    if (response.data && response.data.data) {
      const price = response.data.data.price;
      console.log('Method 2 (API): Price found:', price);
    } else {
      console.log('Method 2 (API): Price not found in API response');
    }
    
  } catch (error) {
    console.log('Method 2 (API): Error or API endpoint not available -', error.message);
  }
}

// Try to extract from local HTML file
async function extractFromLocal() {
  try {
    console.log('\nMethod 3 (Local): Trying to extract price from local files...');
    
    // Try to read the response.html (if we've successfully saved it)
    let html;
    try {
      html = fs.readFileSync(path.join(__dirname, 'response.html'), 'utf8');
      console.log('Method 3 (Local): Found response.html');
    } catch (err) {
      try {
        html = fs.readFileSync(path.join(__dirname, '..', 'page_source.html'), 'utf8');
        console.log('Method 3 (Local): Found page_source.html');
      } catch (err2) {
        console.log('Method 3 (Local): No local HTML files found');
        return;
      }
    }
    
    // Direct string search
    if (html.includes('$620.00')) {
      console.log('Method 3 (Local): Price $620.00 found in the HTML');
    }
    
    // Using Cheerio
    const $ = cheerio.load(html);
    
    // Try different selectors
    const selectors = [
      '[data-price]',
      '[data-pdp-price]',
      '.pdp-price',
      '.pdp-price_size_xl',
      '[class*="price"]',
      '[class*="Price"]',
      '[class*="productPrice"]'
    ];
    
    for (const selector of selectors) {
      const priceElement = $(selector);
      if (priceElement.length > 0) {
        const price = priceElement.text().trim();
        console.log(`Method 3 (Local + Cheerio): Price found with selector "${selector}":`, price);
        break;
      }
    }
  } catch (error) {
    console.error('Method 3 (Local) Error:', error.message);
  }
}

// Main function to run all methods
async function main() {
  console.log('Starting price scraping for Shearwater Peregrine...');
  console.log('Target URL:', productUrl);
  console.log('-----------------------------------------------------');
  
  // First try to extract from local files (fastest)
  await extractFromLocal();
  
  // Then try the live site with Axios
  await fetchPriceWithAxios();
  
  // Try API approach
  await fetchPriceWithApi();
  
  console.log('\nAll methods completed.');
  console.log('Expected price: $620.00');
}

main().catch(error => {
  console.error('Error in main execution:', error);
}); 