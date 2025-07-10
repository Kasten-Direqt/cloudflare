#!/usr/bin/env node

const axios = require('axios');

// Get URL from command line arguments
const url = process.argv[2];

if (!url) {
  console.error('Error: URL is required');
  console.log('Usage: node scrape-cli.js <url>');
  process.exit(1);
}

// Validate URL format
try {
  new URL(url);
} catch (err) {
  console.error('Error: Invalid URL format');
  process.exit(1);
}

console.log(`Scraping URL: ${url}`);

// Make the request
axios.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SimpleScraper/1.0)'
  },
  timeout: 10000
})
.then(response => {
  console.log('\nScrape Results:');
  console.log('==============');
  console.log(`URL: ${url}`);
  console.log(`Status: ${response.status}`);
  console.log(`Content Type: ${response.headers['content-type']}`);
  console.log(`Content Length: ${response.data.length} characters`);
  
  // Show first 500 characters of the response
  console.log('\nPreview of content:');
  console.log('------------------');
  console.log(response.data.substring(0, 500) + '...');
  
  console.log('\nScrape completed successfully!');
})
.catch(error => {
  console.error('\nScraping Error:');
  console.error('===============');
  
  if (error.response) {
    console.error(`Request failed with status code ${error.response.status}`);
  } else if (error.request) {
    console.error('No response received from the target server');
  } else {
    console.error(`Failed to make request: ${error.message}`);
  }
  
  process.exit(1);
});
