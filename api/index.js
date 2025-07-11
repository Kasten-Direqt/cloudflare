const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

const signatures = require('./test.js'); // Import the functions from the compiled JS file

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON in request body
app.use(express.json());

// Add CORS middleware with specific configuration
app.use(cors({
  exposedHeaders: ['Signature', 'Signature-Input'],
  credentials: true,
  origin: true
}));

require('dotenv').config()

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
 * 
 * This implements the IETF draft-meunier-http-message-signatures-directory-01
 * https://datatracker.ietf.org/doc/draft-meunier-http-message-signatures-directory/01/
 */
app.get('/.well-known/http-message-signatures-directory', async (req, res) => {
  // Read the public keys from the file
  const fs = require('fs');
  const signatureUtils = require('./signatureUtils');
  
  try {
    // Set CORS headers specific to this endpoint
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Expose-Headers', 'Signature, Signature-Input');

    // const privateKeyPath = path.join(__dirname, '..', 'private_key.pem');
    const publicKeys = {
  "keys": [
    {
      "kid": "aZgrLENlYZ3zQx7sQmLXTllDr17UCi4On2yp7ILRHN0",
      "kty": "OKP",
      "crv": "Ed25519",
      "x": "kKtwzBjDRUol1mE-5BtPa3n7mwoJDFfItL_dcAQ1qns",
    }
  ],
  "purpose": "rag"
};

    // Get the key ID (JWK thumbprint) from the public keys file
    const kid = publicKeys.keys[0].kid;
    
    // Prepare the response data (only include necessary fields for the directory)
    const keyDirectory = {
      keys: publicKeys.keys.map(key => ({
        kty: key.kty,
        crv: key.crv,
        x: key.x
      }))
    };
    
    // Set the specific IANA media type as required
    res.set({'Content-Type': 'application/http-message-signatures-directory+json'});
    res.setHeader('Cache-Control', 'max-age=10'); // Cache for 24 hours
    
    // Sign the response
    const host = req.get('host') || 'localhost';
    // We'll use web-bot-auth signatures instead of signatureUtils
    // const signatureHeaders = await signatureUtils.signMessage({
    //   kid: kid,
    //   components: ['@authority'],
    //   authority: host
    // });

    try {
      // Get signature headers (wait for the Promise to resolve)
      const sHeaders = await signatures.getSignatureHeaders();
      
      // Set signature headers
      res.setHeader('Signature', sHeaders['Signature']);
      res.setHeader('Signature-Input', sHeaders['Signature-Input']);
      
      // Log the headers being set for debugging
      console.log('Setting signature headers from web-bot-auth:');
      console.log('Signature:', sHeaders['Signature']);
      console.log('Signature-Input:', sHeaders['Signature-Input']);
      
      // Return the key directory
      res.send(keyDirectory);
    } catch (error) {
      console.error('Error getting signature headers:', error);
      res.status(500).json({ 
        error: 'Failed to generate signature headers',
        details: error.message
      });
    }
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
