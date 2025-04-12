const https = require('https');
const url = require('url');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// URL for the Dive Box stainless steel shaker product on Lazada
const productUrl = 'https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html';

// Method 1: Using Node.js https module
async function fetchPriceWithHttps() {
  try {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      },
    };

    return new Promise((resolve, reject) => {
      https.get(productUrl, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            // Method 1.1: Using regex to extract price
            const priceRegex = /\$([0-9,]+\.[0-9]{2})/g;
            const match = data.match(priceRegex);
            
            if (match) {
              console.log('Method 1.1 (HTTPS + Regex): Price found:', match[0]);
              resolve(match[0]);
            } else {
              console.log('Method 1.1 (HTTPS + Regex): Price not found');
            }

            // Method 1.2: Using Cheerio to parse HTML
            const $ = cheerio.load(data);
            
            // Try different selectors that might contain the price
            const selectors = [
              '[data-pdp-price]',
              '.pdp-price',
              '.pdp-price_size_xl',
              '[class*="price"]',
              '[data-price]',
              '[class*="Price"]',
              '[class*="productPrice"]',
              '[itemtype="http://schema.org/Offer"] [itemprop="price"]'
            ];

            for (const selector of selectors) {
              const priceElement = $(selector);
              if (priceElement.length > 0) {
                const price = priceElement.text().trim();
                console.log(`Method 1.2 (HTTPS + Cheerio): Price found with selector "${selector}":`, price);
                resolve(price);
                break;
              }
            }

            // Look for structured data
            const scriptTags = $('script[type="application/ld+json"]');
            scriptTags.each((i, el) => {
              try {
                const jsonData = JSON.parse($(el).html());
                if (jsonData.offers && jsonData.offers.price) {
                  console.log('Method 1.3 (HTTPS + JSON-LD): Price found:', jsonData.offers.price);
                  resolve(jsonData.offers.price);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            });

            console.log('Method 1 (HTTPS): Failed to extract price');
            reject(new Error('Failed to extract price'));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        console.error('Method 1 (HTTPS) Error:', error.message);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Method 1 (HTTPS) Error:', error.message);
    throw error;
  }
}

// Method 2: Using Puppeteer for headless browser automation
async function fetchPriceWithPuppeteer() {
  let browser;
  try {
    console.log('Method 2 (Puppeteer): Launching browser...');
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
    
    // Navigate to the product page
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for the price element to load
    await page.waitForTimeout(3000); // Wait for dynamic content to load
    
    // Try multiple selectors to find the price
    const selectors = [
      '[data-pdp-price]',
      '.pdp-price',
      '.pdp-price_size_xl',
      '[class*="price"]',
      '[data-price]',
      '[class*="Price"]',
      '[class*="productPrice"]'
    ];
    
    for (const selector of selectors) {
      try {
        if (await page.$(selector) !== null) {
          const priceText = await page.$eval(selector, (el) => el.textContent.trim());
          console.log(`Method 2 (Puppeteer): Price found with selector "${selector}":`, priceText);
          return priceText;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    // Try to extract from page source using regex
    const content = await page.content();
    const priceRegex = /\$([0-9,]+\.[0-9]{2})/g;
    const match = content.match(priceRegex);
    
    if (match) {
      console.log('Method 2 (Puppeteer + Regex): Price found:', match[0]);
      return match[0];
    }
    
    // Try to extract from JSON
    const priceData = await page.evaluate(() => {
      try {
        // Look for structured data or any global variables containing price
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of scripts) {
          try {
            const json = JSON.parse(script.textContent);
            if (json.offers && json.offers.price) {
              return json.offers.price;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        // Try to find price in any global variables
        if (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.pdpData) {
          return window.__INITIAL_STATE__.pdpData.price;
        }
        
        return null;
      } catch (e) {
        return null;
      }
    });
    
    if (priceData) {
      console.log('Method 2 (Puppeteer + JSON): Price found:', priceData);
      return priceData;
    }
    
    console.log('Method 2 (Puppeteer): Failed to extract price');
    return null;
  } catch (error) {
    console.error('Method 2 (Puppeteer) Error:', error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Method 3: Using local page source if available
async function fetchPriceFromLocalFile() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Check if we have a cached page source
    const pageSourcePath = path.join(__dirname, '..', 'page_source.html');
    
    if (fs.existsSync(pageSourcePath)) {
      console.log('Method 3 (Local File): Found local page source');
      const content = fs.readFileSync(pageSourcePath, 'utf8');
      
      // Method 3.1: Using regex to extract price
      const priceRegex = /\$([0-9,]+\.[0-9]{2})/g;
      const match = content.match(priceRegex);
      
      if (match) {
        console.log('Method 3.1 (Local + Regex): Price found:', match[0]);
        return match[0];
      }
      
      // Method 3.2: Using Cheerio to parse HTML
      const $ = cheerio.load(content);
      
      // Try different selectors
      const selectors = [
        '[data-pdp-price]',
        '.pdp-price',
        '.pdp-price_size_xl',
        '[class*="price"]',
        '[data-price]',
        '[class*="Price"]',
        '[class*="productPrice"]'
      ];
      
      for (const selector of selectors) {
        const priceElement = $(selector);
        if (priceElement.length > 0) {
          const price = priceElement.text().trim();
          console.log(`Method 3.2 (Local + Cheerio): Price found with selector "${selector}":`, price);
          return price;
        }
      }
      
      // Look for structured data
      const scriptTags = $('script[type="application/ld+json"]');
      let foundPrice = null;
      
      scriptTags.each((i, el) => {
        try {
          const jsonData = JSON.parse($(el).html());
          if (jsonData.offers && jsonData.offers.price) {
            console.log('Method 3.3 (Local + JSON-LD): Price found:', jsonData.offers.price);
            foundPrice = jsonData.offers.price;
            return false; // Break the loop
          }
        } catch (e) {
          // Ignore parsing errors
        }
      });
      
      if (foundPrice) {
        return foundPrice;
      }
      
      // Try to find direct price text
      const bodyText = $('body').text();
      const priceMatches = bodyText.match(/\$([0-9,]+\.[0-9]{2})/g);
      
      if (priceMatches) {
        console.log('Method 3.4 (Local + Body Text): Price found:', priceMatches[0]);
        return priceMatches[0];
      }
      
      console.log('Method 3 (Local File): Failed to extract price');
    } else {
      console.log('Method 3 (Local File): No local page source found');
    }
    
    return null;
  } catch (error) {
    console.error('Method 3 (Local File) Error:', error.message);
    return null;
  }
}

// Run all methods and compare results
async function main() {
  console.log('Starting price scraping for Dive Box stainless steel shaker...');
  
  try {
    // Try to fetch from local file first (fastest)
    const localPrice = await fetchPriceFromLocalFile();
    
    if (localPrice) {
      console.log('\nSuccessfully extracted price using local file:', localPrice);
      return;
    }
  } catch (error) {
    console.error('Error with local file method:', error.message);
  }
  
  try {
    // Try HTTPS method
    const httpsPrice = await fetchPriceWithHttps();
    
    if (httpsPrice) {
      console.log('\nSuccessfully extracted price using HTTPS:', httpsPrice);
      return;
    }
  } catch (error) {
    console.error('Error with HTTPS method:', error.message);
  }
  
  try {
    // Try Puppeteer as last resort (most reliable but slowest)
    const puppeteerPrice = await fetchPriceWithPuppeteer();
    
    if (puppeteerPrice) {
      console.log('\nSuccessfully extracted price using Puppeteer:', puppeteerPrice);
      return;
    }
  } catch (error) {
    console.error('Error with Puppeteer method:', error.message);
  }
  
  console.log('\nFailed to extract price using any method.');
}

main().catch(error => {
  console.error('Error in main execution:', error);
}); 