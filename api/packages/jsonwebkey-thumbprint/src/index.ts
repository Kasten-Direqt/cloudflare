// Computes the first part of the JWK thumbprint as defined in RFC 7638
// jwk is the JWK to compute the thumbprint for
export const jwkThumbprintPreCompute = (jwk: JsonWebKey): Uint8Array => {
  const encoder = new TextEncoder();

  switch (jwk.kty) {
    // Defined in Section 3.2 of RFC 7638
    case "EC":
      return encoder.encode(
        `{"crv":"${jwk.crv}","kty":"EC","x":"${jwk.x}","y":"${jwk.y}"}`
      );
    // Defined in Appendix A.3 of RFC 8037
    case "OKP":
      return encoder.encode(`{"crv":"${jwk.crv}","kty":"OKP","x":"${jwk.x}"}`);
    // Defined in Section 3.2 of RFC 7638
    case "RSA":
      return encoder.encode(`{"e":"${jwk.e}","kty":"RSA","n":"${jwk.n}"}`);
    default:
      throw new Error("Unsupported key type");
  }
};

// The JWK thumbprint is defined in Section 3 of RFC 7638
// jwk is the JWK to compute the thumbprint for
// hash is the hash function to use (e.g. SHA-256)
// decode is the function to decode the hash value (e.g. base64url)
export const jwkThumbprint = async (
  jwk: JsonWebKey,
  hash: (b: BufferSource) => Promise<ArrayBuffer>,
  decode: (s: ArrayBuffer) => string
): Promise<string> => {
  const precomputed = jwkThumbprintPreCompute(jwk);
  const hashValue = await hash(precomputed);
  return decode(hashValue);
};
