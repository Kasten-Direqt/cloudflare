const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const signatures = require('./getHeaders.js');

const app = express();

app.use(express.json());

require('dotenv').config()

/**
 * HTTP Message Signatures Directory endpoint
 * Serves a directory of signatures with the IANA media type
 * application/http-message-signatures-directory+json
 * 
 * This implements the IETF draft-meunier-http-message-signatures-directory-01
 * https://datatracker.ietf.org/doc/draft-meunier-http-message-signatures-directory/01/
 */
app.get('/.well-known/http-message-signatures-directory', async (req, res) => {
  
  try {
    const publicKeyPath = path.join(__dirname, 'publicKey.json');
    const publicKey = JSON.parse(fs.readFileSync(publicKeyPath, 'utf8'));
    
    const keyDirectory = {
      keys: [{
        "kty": publicKey.kty,
        "crv": publicKey.crv,
        "x": publicKey.x,
      }]
    };
    
    res.set({'Content-Type': 'application/http-message-signatures-directory+json'});
    res.setHeader('Cache-Control', 'max-age=86400');
    
    try {
      const sigHeaders = await signatures.getSignatureHeaders();

      res.setHeader('Signature', sigHeaders['Signature']);
      res.setHeader('Signature-Input', sigHeaders['Signature-Input']);

      console.log('Setting signature headers from web-bot-auth:');
      console.log('Signature:', sigHeaders['Signature']);
      console.log('Signature-Input:', sigHeaders['Signature-Input']);

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

    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Scraping URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SimpleScraper/1.0)'
      },
      timeout: 10000
    });

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
    if (error.response) {
      return res.status(error.response.status).json({
        error: `Request failed with status code ${error.response.status}`,
        details: error.message
      });
    } else if (error.request) {
      return res.status(500).json({
        error: 'No response received from the target server',
        details: error.message
      });
    } else {
      return res.status(500).json({
        error: 'Failed to make request',
        details: error.message
      });
    }
  }
});

app.use(express.static(path.join(__dirname, '..', 'public')));
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// Export the app for serverless environments like Vercel
module.exports = app;