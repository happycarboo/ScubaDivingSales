@echo off
echo =====================================
echo Lazada Price Scraper - Running All Methods
echo Target: Shearwater Peregrine ($620.00)
echo =====================================

echo.
echo ===== Method 0: Simple Price Extractor (Recommended) =====
node price_extractor.js

echo.
echo ===== Method 1: Source HTML Analysis =====
node extract_from_source.js

echo.
echo ===== Method 2: Axios-Based Scraper =====
node fetch_price_axios.js

echo.
echo ===== Method 3: Full Scraper with Multiple Methods =====
node fetch_price.js

echo.
echo ===== Method 4: Lazada-Specific Extractor =====
node lazada_price_extractor.js

echo.
echo =====================================
echo All methods completed
echo Check output files for detailed results
echo =====================================

pause 