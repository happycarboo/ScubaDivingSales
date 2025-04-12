const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Function to download image
async function downloadImage(url, folderPath, filename) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });
    
    const filePath = path.join(folderPath, filename);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Successfully downloaded: ${filePath}`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error.message);
  }
}

// Function to extract product details from a product page
async function extractProductDetails(url) {
  try {
    console.log(`Extracting details from: ${url}`);
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    };
    
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    
    // Extract product name
    let productName = '';
    const nameSelectors = [
      'h1.product_title',                // WooCommerce standard
      '.product_title',                  // Common class
      'h1.entry-title',                  // Common WordPress
      '[itemprop="name"]',               // Schema.org markup
      'h1',                              // Fallback to first h1
    ];
    
    for (const selector of nameSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        productName = element.text().trim();
        if (productName) {
          console.log(`Found product name: ${productName}`);
          break;
        }
      }
    }
    
    // Try different selectors to find product images
    let mainImage = null;
    const additionalImages = [];
    
    // Main image selectors
    const mainImageSelectors = [
      'img.wp-post-image',                 // Main product image
      '.woocommerce-product-gallery__image img',  // WooCommerce gallery image
      '.product-images img',               // Generic product images
      'img[itemprop="image"]',             // Image with itemprop attribute
      '.product-gallery img',              // Product gallery
      'img[src*="product"]'                // Any image with "product" in src
    ];
    
    for (const selector of mainImageSelectors) {
      const img = $(selector).first();
      if (img.length > 0) {
        const src = img.attr('src');
        if (src) {
          console.log(`Found main image: ${src}`);
          mainImage = src;
          break;
        }
      }
    }
    
    // Additional images
    $('.woocommerce-product-gallery__image img').each((i, el) => {
      if (i > 0) { // Skip first one as it's likely the main image
        const src = $(el).attr('src');
        if (src && !additionalImages.includes(src) && src !== mainImage) {
          additionalImages.push(src);
        }
      }
    });
    
    // Alternative gallery images
    $('.product-thumbnails img, .thumbnails img').each((i, el) => {
      const src = $(el).attr('src');
      // Get full-size image if available (replace thumbnail with full image)
      const fullSrc = src?.replace('-thumbnail', '')
                         ?.replace('-thumb', '')
                         ?.replace('-small', '')
                         ?.replace('-100x100', '')
                         ?.replace(/-\d+x\d+/, '');
      
      if (fullSrc && !additionalImages.includes(fullSrc) && fullSrc !== mainImage) {
        additionalImages.push(fullSrc);
      }
    });
    
    console.log(`Found ${additionalImages.length} additional images`);
    
    return {
      name: productName || 'Unknown Product',
      mainImage,
      additionalImages
    };
  } catch (error) {
    console.error(`Error extracting details from ${url}:`, error.message);
    return {
      name: 'Unknown Product',
      mainImage: null,
      additionalImages: []
    };
  }
}

// Function to parse CSV file and extract URLs
function parseCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Find the URL column - could be "web link", "link", etc.
    const urlColumns = ['web link', 'weblink', 'link', 'url'];
    
    return records.map(record => {
      for (const col of urlColumns) {
        if (record[col]) {
          return {
            url: record[col],
            brand: record.Brand || '',
            model: record.Model || ''
          };
        }
      }
      
      // If we can't find a specific column, try the last column which often contains the URL
      const keys = Object.keys(record);
      const lastColumn = keys[keys.length - 1];
      return {
        url: record[lastColumn],
        brand: record.Brand || '',
        model: record.Model || ''
      };
    }).filter(item => item.url && item.url.includes('scubawarehouse.com.sg'));
  } catch (error) {
    console.error(`Error parsing CSV file ${filePath}:`, error.message);
    return [];
  }
}

// Function to create a safe folder name from product details
function createSafeFolderName(brand, model, name) {
  // Use product name if available, otherwise use brand+model
  const baseName = name && name !== 'Unknown Product' 
    ? name 
    : `${brand} ${model}`;
  
  // Remove invalid chars and make safe for filesystem
  return baseName
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50); // Avoid too long paths
}

// Main function to download images from all CSV files
async function downloadImages() {
  // Create main product_images directory if it doesn't exist
  const baseDir = path.join(__dirname, 'product_images');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }
  
  // Parse CSV files
  const bcdItems = parseCSV(path.join(__dirname, '../doc/BCD.csv'));
  const regulatorItems = parseCSV(path.join(__dirname, '../doc/Regulator.csv'));
  
  // Combine all items
  const allItems = [...bcdItems, ...regulatorItems];
  
  console.log(`Found ${allItems.length} ScubaWarehouse URLs in CSV files`);
  
  // Limit to 8 URLs as requested
  const limitedItems = allItems.slice(0, 8);
  
  // Write info file with all URLs
  const urlsLog = limitedItems.map((item, i) => 
    `${i+1}. ${item.brand} ${item.model}: ${item.url}`
  ).join('\n');
  fs.writeFileSync(path.join(baseDir, 'processed_urls.txt'), urlsLog);
  
  // Process each URL
  for (let i = 0; i < limitedItems.length; i++) {
    const item = limitedItems[i];
    console.log(`\nProcessing item ${i+1}/${limitedItems.length}: ${item.brand} ${item.model}`);
    
    // Extract product details from page
    const productDetails = await extractProductDetails(item.url);
    
    // Create folder name based on product info
    const folderName = createSafeFolderName(item.brand, item.model, productDetails.name);
    const productFolder = path.join(baseDir, folderName);
    
    // Create product-specific folder
    if (!fs.existsSync(productFolder)) {
      fs.mkdirSync(productFolder);
    }
    
    // Save product info to text file
    const productInfo = `Product: ${productDetails.name || 'Unknown'}\nBrand: ${item.brand}\nModel: ${item.model}\nURL: ${item.url}`;
    fs.writeFileSync(path.join(productFolder, 'product_info.txt'), productInfo);
    
    // Download main image
    if (productDetails.mainImage) {
      await downloadImage(
        productDetails.mainImage,
        productFolder,
        'main.jpg'
      );
    }
    
    // Download additional images
    for (let j = 0; j < productDetails.additionalImages.length; j++) {
      const imageUrl = productDetails.additionalImages[j];
      await downloadImage(
        imageUrl,
        productFolder,
        `image_${j+1}.jpg`
      );
    }
    
    // Add small delay between requests to avoid triggering rate limits
    if (i < limitedItems.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log('\nDownload complete! Images saved to ./product_images/ directory');
  console.log(`Processed ${limitedItems.length} products with individual folders`);
}

// Run the script
downloadImages().catch(err => {
  console.error('Error running script:', err);
}); 