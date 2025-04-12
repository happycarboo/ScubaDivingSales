console.log("Testing fixed URLs file:"); const urls = require("fs").readFileSync("fixed_urls.txt", "utf8").split("
").filter(Boolean); console.log(urls);
