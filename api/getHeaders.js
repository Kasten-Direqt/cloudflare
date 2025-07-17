const { directoryResponseHeaders, signatureHeaders } = require("web-bot-auth");
const { signerFromJWK } = require("web-bot-auth/crypto");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const publicKeyPath = path.join(__dirname, 'publicKey.json');
const publicKey = JSON.parse(fs.readFileSync(publicKeyPath, 'utf8'));

const PRIVATE_KEY = {
  ...publicKey,
  "key_ops": ["sign"],
  "d": process.env.PRIVATE_D
};

async function getDirectoryHeaders(url = "https://cloudflare-five-beta.vercel.app/.well-known/http-message-signatures-directory") {
  const request = new Request(url);

  const now = new Date();
  const headers = await directoryResponseHeaders(
    request,
    [await signerFromJWK(PRIVATE_KEY)],
    {
      created: now,
      expires: new Date(now.getTime() + 300_000),
    }
  );
  console.log('Generated directory headers:', headers);
  return headers;
}

async function getRequestHeaders(url) {
  const request = new Request(url);

  const now = new Date();
  const headers = await signatureHeaders(
    request,
    await signerFromJWK(PRIVATE_KEY),
    {
      created: now,
      expires: new Date(now.getTime() + 300_000), // now + 5 min
    }
  );
  return headers;
}

module.exports = {
  getDirectoryHeaders,
  getRequestHeaders
};
