async function generateJwkThumbprint() {
  try {
    // Generate the Ed25519 key pair
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
      {
        name: "Ed25519",
      },
      true,  // Key is extractable
      ["sign", "verify"]  // Key usages: signing and verifying
    );

    // Export the public key as JWK
    const publicKeyJwk = await crypto.subtle.exportKey("jwk", publicKey);
    console.log("Public Key (JWK):", JSON.stringify(publicKeyJwk));
    
    // Export the private key as JWK
    const privateKeyJwk = await crypto.subtle.exportKey("jwk", privateKey);
    console.log("Private Key (JWK):", JSON.stringify(privateKeyJwk));
    

    // Canonicalize the JWK for the thumbprint
    const jwkCanonical = {
      crv: publicKeyJwk.crv,  // "Ed25519"
      kty: publicKeyJwk.kty,  // "OKP"
      x: publicKeyJwk.x       // Public key raw data (base64url)
    };

    // Convert the canonicalized JWK to a JSON string
    const jwkJson = JSON.stringify(jwkCanonical);

    // Calculate the SHA-256 hash of the JSON string
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(jwkJson));

    // Convert the hash buffer to a base64 URL-encoded string
    const hashArray = new Uint8Array(hashBuffer);
    const hashBase64 = btoa(String.fromCharCode(...hashArray));

    // Convert to base64 URL encoding
    const base64Url = hashBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    console.log("JWK Thumbprint (Base64 URL):", base64Url);
    
  } catch (error) {
    console.error("Error generating JWK thumbprint:", error);
  }
}

// Call the function to generate the thumbprint
await generateJwkThumbprint();