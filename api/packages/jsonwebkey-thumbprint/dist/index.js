var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  jwkThumbprint: () => jwkThumbprint,
  jwkThumbprintPreCompute: () => jwkThumbprintPreCompute
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jwkThumbprint,
  jwkThumbprintPreCompute
});
