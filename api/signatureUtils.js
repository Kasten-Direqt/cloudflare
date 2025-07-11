// signatureUtils.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

/**
 * Generate a nonce for HTTP message signatures
 * @returns {string} base64url encoded nonce
 */
function generateNonce() {
  const nonceBuffer = crypto.randomBytes(48);
  return nonceBuffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Create a signature input string for HTTP message signatures
 * @param {Object} options Configuration options for signature
 * @returns {string} The signature input string
 */
function createSignatureInput(options) {
  const { kid, created, expires, nonce, components } = options;
  
  // Format components string
  const componentsStr = components.map(c => `"${c}"`).join(' ');
  
  // Build signature input with required parameters
  return `(${componentsStr});alg="ed25519";keyid="${kid}";nonce="${nonce}";tag="http-message-signatures-directory";created=${created};expires=${expires}`;
}

/**
 * Sign message components using Ed25519 private key
 * @param {Object} options Options for signing
 * @returns {Object} The signature and signature input headers
 */
async function signMessage(options) {
  const { components, kid } = options;
  
  try {
    // Create nonce for uniqueness
    const nonce = generateNonce();
    
    // Generate timestamps (in seconds)
    const created = Math.floor(Date.now() / 1000);
    const expires = created + 600; // Valid for 10 minutes
    
    // Create signature input
    const sigInput = createSignatureInput({
      kid,
      created,
      expires,
      nonce,
      components
    });

    // Format the response with @authority and @signature-params
    const authority = "cloudflare-five-beta.vercel.app";

    const to_sign = `'@authority': ${authority}\n'@signature-params': ${sigInput}`;
    console.log(to_sign);

    // Sign the message
    const signature = crypto.sign(null, Buffer.from(to_sign), crypto.createPrivateKey(process.env.PRIVATE_KEY));
    
    // Convert signature to base64url format
    const signatureBase64 = signature.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return {
      'Signature': `sig1=:${signatureBase64}==:`,
      'Signature-Input': `sig1=${sigInput}`
    };
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
}

module.exports = {
  generateNonce,
  createSignatureInput,
  signMessage
};
