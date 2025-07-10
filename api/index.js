const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON in request body
app.use(express.json());

/**
 * Scraper endpoint to fetch content from a provided URL
 * Request body should contain { url: "https://example.com" }
 */
app.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Scraping URL: ${url}`);
    
    // Make request to the provided URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SimpleScraper/1.0)'
      },
      // Set timeout to avoid hanging requests
      timeout: 10000
    });

    // Return the response data and metadata
    res.json({
      success: true,
      url: url,
      status: response.status,
      headers: response.headers,
      contentLength: response.data.length,
      data: response.data
    });
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    
    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        error: `Request failed with status code ${error.response.status}`,
        details: error.message
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({
        error: 'No response received from the target server',
        details: error.message
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        error: 'Failed to make request',
        details: error.message
      });
    }
  }
});

// Simple GET endpoint to test if the service is running
app.get('/', (req, res) => {
  res.json({
    message: 'Simple Scraper API is running',
    usage: 'Send a POST request to /scrape with JSON body containing { "url": "https://example.com" }'
  });
});

// If we're not in a Vercel environment, start the server normally
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Simple Scraper server running at http://localhost:${port}`);
  });
}

// Export the app for serverless environments like Vercel
module.exports = app;
