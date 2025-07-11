// Compiled JavaScript version of test.ts
// const { signatureHeaders } = require("web-bot-auth");
const { directoryResponseHeaders } = require("web-bot-auth");
const { signerFromJWK } = require("web-bot-auth/crypto");
require('dotenv').config();

// Wrap the top-level await code in an async function
async function getHeaders() {
  // The following simple request is going to be signed
  const request = new Request("https://cloudflare-five-beta.vercel.app/.well-known/http-message-signatures-directory");

  // This is a testing-only private key/public key pair described in RFC 9421 Appendix B.1.4
  // Also available at https://github.com/cloudflareresearch/web-bot-auth/blob/main/examples/rfc9421-keys/ed25519.json
  const RFC_9421_ED25519_TEST_KEY = {"key_ops":["sign"],"ext":true,"crv":"Ed25519","d":process.env.PRIVATE_D,"x":"kKtwzBjDRUol1mE-5BtPa3n7mwoJDFfItL_dcAQ1qns","kty":"OKP","alg":"Ed25519"};
  const now = new Date();
  const headers = await directoryResponseHeaders(
    request,
    [await signerFromJWK(RFC_9421_ED25519_TEST_KEY)],
    {
      created: now,
      expires: new Date(now.getTime() + 300_000), // now + 5 min
    }
  );
  console.log("hi");

  console.log("Signature Headers:", headers);

  // Et voila! Here is our signed request.
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
