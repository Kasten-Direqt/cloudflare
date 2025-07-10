// generateKeys.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function generateJwkThumbprint() {
  try {
    console.log("Generating Ed25519 key pair...");
    
    // Node.js doesn't support Ed25519 directly with subtle crypto yet
    // Using Node.js native crypto module instead
    const keyPair = crypto.generateKeyPair('ed25519', {
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    }, (err, publicKey, privateKey) => {
      if (err) {
        console.error("Error generating key pair:", err);
        return;
      }
      
      // Convert public key to JWK format
      const publicKeyBuffer = crypto.createPublicKey(publicKey).export({ format: 'der', type: 'spki' });
      
      // Extract the raw key part (removing ASN.1 encoding)
      // Ed25519 public key is 32 bytes, located at the end of the DER encoding
      const rawPublicKey = publicKeyBuffer.slice(publicKeyBuffer.length - 32);
      
      // Convert to base64url format for JWK
      const x = rawPublicKey.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Create JWK
      const publicKeyJwk = {
        kty: "OKP",
        crv: "Ed25519",
        x: x
      };
      
      console.log("Public Key (JWK):", JSON.stringify(publicKeyJwk, null, 2));
      
      // Canonicalize the JWK for the thumbprint
      const jwkCanonical = {
        crv: publicKeyJwk.crv,
        kty: publicKeyJwk.kty,
        x: publicKeyJwk.x
      };
      
      // Convert the canonicalized JWK to a JSON string
      const jwkJson = JSON.stringify(jwkCanonical);
      
      // Calculate the SHA-256 hash of the JSON string
      const hashBuffer = crypto.createHash('sha256').update(jwkJson).digest();
      
      // Convert the hash buffer to a base64 URL-encoded string
      const hashBase64 = hashBuffer.toString('base64');
      
      // Convert to base64 URL encoding
      const kid = hashBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      console.log("JWK Thumbprint (kid):", kid);
      
      // Generate nbf (Not Before) timestamp - current time in milliseconds
      const nbf = Date.now();
      
      // Create the public keys JSON file
      const publicKeysJson = {
        keys: [
          {
            kid: kid,
            kty: "OKP",
            crv: "Ed25519",
            x: x,
            nbf: nbf
          }
        ],
        purpose: "rag"
      };
      
      // Write public keys to file
      const publicKeysPath = path.join(__dirname, '..', 'public_keys.json');
      fs.writeFileSync(publicKeysPath, JSON.stringify(publicKeysJson, null, 2));
      console.log(`Public keys written to ${publicKeysPath}`);
      
      // Store private key in another file
      const privateKeyPath = path.join(__dirname, '..', 'private_key.pem');
      fs.writeFileSync(privateKeyPath, privateKey);
      console.log(`Private key written to ${privateKeyPath}`);
      
      // Also create a full key pair JSON for reference
      const keyPairJson = {
        publicKey: publicKeyJwk,
        privateKey: privateKey,
        kid: kid
      };
      
      const keyPairPath = path.join(__dirname, '..', 'key_pair.json');
      fs.writeFileSync(keyPairPath, JSON.stringify(keyPairJson, null, 2));
      console.log(`Complete key information written to ${keyPairPath}`);
    });
    
  } catch (error) {
    console.error("Error in key generation process:", error);
  }
}

// Call the function to generate the thumbprint
generateJwkThumbprint();
