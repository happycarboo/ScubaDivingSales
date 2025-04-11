# Lazada Price Scraper

This project contains scripts designed to extract product prices from Lazada Singapore.

## Setup
1. Make sure you have Node.js installed
2. Install dependencies:
```
cd "price scrape"
npm install
```

## How to Use

### Method 1: Extract Prices from Multiple URLs (Recommended)

1. Add product URLs to `fixed_urls.txt` (one URL per line)
   - Make sure to use simplified URLs without query parameters
   - Example format: `https://www.lazada.sg/products/product-name-iXXXXXXXXXX-sXXXXXXXXXX.html`

2. Run the shell script:
   ```
   ./process_urls.sh
   ```

3. View results in the console output:
   ```
   == Simple Lazada Price Extractor ==
   Extracting from: https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html
   Fetching page...
   Found price: $17.00
   Price: $17.00
   Time: 0.308 seconds
   -------------------
   ```

### Method 2: Extract Price from a Single URL

1. Edit `simple_price_extractor.js` to set your target URL:
   ```javascript
   // EDIT THIS SECTION - PUT YOUR PRODUCT URL HERE
   const productUrl = "https://www.lazada.sg/products/your-product-url.html";
   ```

2. Run the script:
   ```
   node simple_price_extractor.js
   ```

## Available Scripts

### Main Scripts

1. **Simple Price Extractor (single URL)**
```
node simple_price_extractor.js
```
A lightweight script that extracts the price from a single URL configured in the file.

2. **Multiple URL Processing (batch extraction)**
```
./process_urls.sh
```
A shell script that processes all URLs in `fixed_urls.txt` and displays their prices.

### Additional Scripts

1. **Main Scraper (Various Methods)**
```
npm run test
```
This script tries multiple approaches including HTTPS requests, Cheerio for HTML parsing, and Puppeteer for browser automation.

2. **Axios-Based Scraper**
```
npm run test-axios
```
This script focuses on using Axios for HTTP requests with various extraction methods.

3. **Lazada-Specific Extractor**
```
npm run lazada-extract
```
This script is specialized for Lazada, with knowledge of its site structure and approach to price display.

## URL Format Guidelines

When adding URLs to `fixed_urls.txt`:

1. **Use simplified URLs**:
   - Correct: `https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html`
   - Incorrect: ~~`https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html?click=...`~~

2. **Keep the product ID intact**:
   - The `iXXXXXXXXXX-sXXXXXXXXXX` part contains the product and seller IDs
   - Do not modify these numbers as they identify the specific product

## Example URLs

```
https://www.lazada.sg/products/dive-box-stainless-steel-shaker-i2712954458-s18273448333.html
https://www.lazada.sg/products/shearwater-peregrine-i2834363533-s19538607194.html
https://www.lazada.sg/products/dive-box-compact-underwater-slate-i2712858237-s18271739637.html
https://www.lazada.sg/products/dive-box-scuba-wrist-slate-i2712948329-s18273141812.html
```

## Troubleshooting

If you encounter issues:

1. **URL Problems**:
   - Remove all query parameters (everything after `?` in the URL)
   - Ensure the URL format follows the example above

2. **Script Errors**:
   - Make sure all dependencies are installed (`npm install`)
   - Try running with a single URL first to isolate issues

3. **No Price Found**:
   - Lazada's page structure may have changed; try viewing the page source
   - Update the CSS selectors in the script if necessary

## Extraction Methods

The scripts use multiple strategies to extract prices:

1. **Regex Pattern Matching** - Looking for patterns like "$XX.XX" (fastest method)
2. **CSS Selectors** - Using various selectors to find price elements in the HTML
3. **Browser Automation** - Using Puppeteer for complex pages (slowest but most reliable)

## Performance

- Simple extraction takes ~0.5 seconds per URL
- Full browser automation takes ~5-15 seconds per URL
- The shell script processes URLs sequentially 