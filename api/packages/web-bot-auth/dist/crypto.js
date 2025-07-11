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

// src/crypto.ts
var crypto_exports = {};
__export(crypto_exports, {
  Ed25519Signer: () => Ed25519Signer,
  RSAPSSSHA512Signer: () => RSAPSSSHA512Signer,
  helpers: () => helpers,
  signerFromJWK: () => signerFromJWK,
  verifier: () => verifier,
  verifierFromJWK: () => verifierFromJWK
});
module.exports = __toCommonJS(crypto_exports);
var import_jsonwebkey_thumbprint = require("jsonwebkey-thumbprint");

// src/base64.ts
function u8ToB64(u) {
  return btoa(String.fromCharCode(...u));
}
function b64ToB64URL(b) {
  return b.replace(/\+/g, "-").replace(/\//g, "_");
}
function b64ToB64NoPadding(b) {
  return b.replace(/=/g, "");
}

// src/crypto.ts
var helpers = {
  WEBCRYPTO_SHA256: (b) => crypto.subtle.digest("SHA-256", b),
  BASE64URL_DECODE: (u) => b64ToB64URL(b64ToB64NoPadding(u8ToB64(new Uint8Array(u))))
};
var Ed25519Signer = class _Ed25519Signer {
  constructor(keyid, privateKey) {
    this.alg = "ed25519";
    this.keyid = keyid;
    this.privateKey = privateKey;
  }
  static async fromJWK(jwk) {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "Ed25519" },
      true,
      ["sign"]
    );
    const keyid = await (0, import_jsonwebkey_thumbprint.jwkThumbprint)(
      jwk,
      helpers.WEBCRYPTO_SHA256,
      helpers.BASE64URL_DECODE
    );
    return new _Ed25519Signer(keyid, key);
  }
  async sign(data) {
    const message = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(
      "ed25519",
      this.privateKey,
      message
    );
    return new Uint8Array(signature);
  }
};
var RSAPSSSHA512Signer = class _RSAPSSSHA512Signer {
  constructor(keyid, privateKey) {
    this.alg = "rsa-pss-sha512";
    this.keyid = keyid;
    this.privateKey = privateKey;
  }
  static async fromJWK(jwk) {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      // restricting to RSA-PSS with SHA-512 as other SHA- algorithms are not registered
      { name: "RSA-PSS", hash: { name: "SHA-512" } },
      true,
      ["sign"]
    );
    const keyid = await (0, import_jsonwebkey_thumbprint.jwkThumbprint)(
      jwk,
      helpers.WEBCRYPTO_SHA256,
      helpers.BASE64URL_DECODE
    );
    return new _RSAPSSSHA512Signer(keyid, key);
  }
  async sign(data) {
    const message = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 64 },
      this.privateKey,
      message
    );
    return new Uint8Array(signature);
  }
};
function signerFromJWK(jwk) {
  switch (jwk.kty) {
    case "OKP":
      if (jwk.crv === "Ed25519") {
        return Ed25519Signer.fromJWK(jwk);
      }
      throw new Error(`Unsupported curve: ${jwk.crv}`);
    case "RSA":
      if (jwk.alg === "PS512") {
        return RSAPSSSHA512Signer.fromJWK(jwk);
      }
      throw new Error(`Unsupported algorithm: ${jwk.alg}`);
    default:
      throw new Error(`Unsupported key type: ${jwk.kty}`);
  }
}
function verifier(key) {
  return async (data, signature, params) => {
    const encodedData = new TextEncoder().encode(data);
    const cryptoParams = key.algorithm;
    switch (key.algorithm.name) {
      case "Ed25519":
        break;
      case "RSA-PSS":
        cryptoParams["saltLength"] = 64;
        break;
      default:
        throw new Error(`Unsupported algorithm: ${key.algorithm.name}`);
    }
    const isValid = await crypto.subtle.verify(
      cryptoParams,
      key,
      signature,
      encodedData
    );
    if (!isValid) {
      throw new Error("invalid signature");
    }
  };
}
async function verifierFromJWK(jwk) {
  let key;
  switch (jwk.kty) {
    case "OKP":
      if (jwk.crv === "Ed25519") {
        key = await crypto.subtle.importKey(
          "jwk",
          { kty: jwk.kty, crv: jwk.crv, x: jwk.x },
          { name: "Ed25519" },
          true,
          ["verify"]
        );
        break;
      }
      throw new Error(`Unsupported curve: ${jwk.crv}`);
    case "RSA":
      if (jwk.alg === "PS512") {
        key = await crypto.subtle.importKey(
          "jwk",
          { kty: jwk.kty, e: jwk.e, n: jwk.n },
          // restricting to RSA-PSS with SHA-512 as other SHA- algorithms are not registered
          { name: "RSA-PSS", hash: { name: "SHA-512" } },
          true,
          ["verify"]
        );
        break;
      }
      throw new Error(`Unsupported algorithm: ${jwk.alg}`);
    default:
      throw new Error(`Unsupported key type: ${jwk.kty}`);
  }
  return verifier(key);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Ed25519Signer,
  RSAPSSSHA512Signer,
  helpers,
  signerFromJWK,
  verifier,
  verifierFromJWK
});
