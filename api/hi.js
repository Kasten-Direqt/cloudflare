// Convert to CommonJS (require) style imports
const webBotAuth = require("web-bot-auth");
const webBotAuthCrypto = require("web-bot-auth/crypto");
const { verify } = webBotAuth;
const { verifierFromJWK } = webBotAuthCrypto;
const { signatureHeaders } = webBotAuth;
const { signerFromJWK } = webBotAuthCrypto;

// Import dotenv
require('dotenv').config();

console.log("Environment variable:", process.env.PRIVATE_D);

// Wrap everything in an async function
async function main() {
  try {
    // The following simple request is going to be signed
    const request = new Request("https://example.com");

    // This is a testing-only private key/public key pair described in RFC 9421 Appendix B.1.4
    // Also available at https://github.com/cloudflareresearch/web-bot-auth/blob/main/examples/rfc9421-keys/ed25519.json
    const RFC_9421_ED25519_TEST_KEY = {
      kty: "OKP",
      crv: "Ed25519",
      kid: "test-key-ed25519",
      // Fixed format for the keys
      d: process.env.PRIVATE_D, 
      x: "kKtwzBjDRUol1mE-5BtPa3n7mwoJDFfItL_dcAQ1qns",
    };

    const now = new Date();
    const headers = await signatureHeaders(
      request,
      await signerFromJWK(RFC_9421_ED25519_TEST_KEY),
      {
        created: now,
        expires: new Date(now.getTime() + 300_000), // now + 5 min
      }
    );

    console.log("Generated headers:", headers);

    // Reusing the incoming request signed in the above section
    const signedRequest = new Request("https://example.com", {
      headers: {
        Signature: headers["Signature"],
        "Signature-Input": headers["Signature-Input"],
      },
    });

    await verify(signedRequest, await verifierFromJWK(RFC_9421_ED25519_TEST_KEY));

    console.log("Signature verification successful!");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the main function
main();