const { directoryResponseHeaders } = require("web-bot-auth");
const { signerFromJWK } = require("web-bot-auth/crypto");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function getHeaders(url = "https://cloudflare-five-beta.vercel.app/.well-known/http-message-signatures-directory") {
  const request = new Request(url);

  const publicKeyPath = path.join(__dirname, 'publicKey.json');
  const publicKey = JSON.parse(fs.readFileSync(publicKeyPath, 'utf8'));
  
  const PRIVATE_KEY = {
    ...publicKey,
    "key_ops": ["sign"],
    "d": process.env.PRIVATE_D
  };
  const now = new Date();
  const headers = await directoryResponseHeaders(
    request,
    [await signerFromJWK(PRIVATE_KEY)],
    {
      created: now,
      expires: new Date(now.getTime() + 300_000),
    }
  );

  return headers;
}

// Create a non-async wrapper that returns the promise
function getSignatureHeaders() {
  return getHeaders();
}

// Export the functions
module.exports = {
  getSignatureHeaders,
  getHeaders
};
