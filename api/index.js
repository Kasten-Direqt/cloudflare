const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON in request body
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

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

/**
 * HTTP Message Signatures Directory endpoint
 * Serves a directory of signatures with the IANA media type
 * application/http-message-signatures-directory+json
 */
app.get('/signatures-directory', (req, res) => {
  // Read the public keys from the file
  const fs = require('fs');
  const path = require('path');
  
  try {
    const publicKeysPath = path.join(__dirname, '..', 'public_keys.json');
    const publicKeys = JSON.parse(fs.readFileSync(publicKeysPath, 'utf8'));
    
    // Create a signatures directory structure
    const signaturesDirectory = {
      signatures: [
        {
          id: "sig1",
          algorithm: "ed25519",
          key_id: publicKeys.keys[0].kid,
          created: new Date().toISOString(),
          expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
          headers: ["(created)", "(expires)", "host", "date", "content-type"]
        }
      ],
      keys: publicKeys.keys
    };
    
    // Set the specific IANA media type
    res.setHeader('Content-Type', 'application/http-message-signatures-directory+json');
    
    // Return the signatures directory
    res.send(signaturesDirectory);
  } catch (error) {
    console.error('Error serving signatures directory:', error);
    res.status(500).json({ 
      error: 'Failed to serve signatures directory',
      details: error.message
    });
  }
});

// If we're not in a Vercel environment, start the server normally
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Simple Scraper server running at http://localhost:${port}`);
  });
}

// Export the app for serverless environments like Vercel
module.exports = app;
