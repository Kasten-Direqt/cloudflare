// src/index.ts
var jwkThumbprintPreCompute = (jwk) => {
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
var jwkThumbprint = async (jwk, hash, decode) => {
  const precomputed = jwkThumbprintPreCompute(jwk);
  const hashValue = await hash(precomputed);
  return decode(hashValue);
};
export {
  jwkThumbprint,
  jwkThumbprintPreCompute
};
