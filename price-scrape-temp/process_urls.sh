#!/bin/bash
cat fixed_urls.txt | while read url; do sed -i "" "s|const productUrl = \".*\";|const productUrl = \"$url\";|" simple_price_extractor.js && node simple_price_extractor.js && echo "-------------------"; done
