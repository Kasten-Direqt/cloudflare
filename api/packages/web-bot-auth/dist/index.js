var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  HTTP_MESSAGE_SIGNAGURE_TAG: () => HTTP_MESSAGE_SIGNAGURE_TAG,
  HTTP_MESSAGE_SIGNATURES_DIRECTORY: () => import_http_message_sig.HTTP_MESSAGE_SIGNATURES_DIRECTORY,
  MediaType: () => import_http_message_sig.MediaType,
  NONCE_LENGTH_IN_BYTES: () => NONCE_LENGTH_IN_BYTES,
  REQUEST_COMPONENTS: () => REQUEST_COMPONENTS,
  REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT: () => REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT,
  SIGNATURE_AGENT_HEADER: () => SIGNATURE_AGENT_HEADER,
  Tag: () => import_http_message_sig.Tag,
  directoryResponseHeaders: () => import_http_message_sig.directoryResponseHeaders,
  generateNonce: () => generateNonce,
  helpers: () => helpers,
  jwkToKeyID: () => import_jsonwebkey_thumbprint2.jwkThumbprint,
  signatureHeaders: () => signatureHeaders2,
  signatureHeadersSync: () => signatureHeadersSync2,
  validateNonce: () => validateNonce,
  verify: () => verify2
});
module.exports = __toCommonJS(index_exports);
var httpsig = __toESM(require("http-message-sig"));
var import_http_message_sig = require("http-message-sig");
var import_jsonwebkey_thumbprint2 = require("jsonwebkey-thumbprint");

// src/base64.ts
function u8ToB64(u) {
  return btoa(String.fromCharCode(...u));
}
function b64Tou8(b) {
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}
function b64ToB64URL(b) {
  return b.replace(/\+/g, "-").replace(/\//g, "_");
}
function b64ToB64NoPadding(b) {
  return b.replace(/=/g, "");
}

// src/crypto.ts
var import_jsonwebkey_thumbprint = require("jsonwebkey-thumbprint");
var helpers = {
  WEBCRYPTO_SHA256: (b) => crypto.subtle.digest("SHA-256", b),
  BASE64URL_DECODE: (u) => b64ToB64URL(b64ToB64NoPadding(u8ToB64(new Uint8Array(u))))
};

// src/index.ts
var HTTP_MESSAGE_SIGNAGURE_TAG = "web-bot-auth";
var SIGNATURE_AGENT_HEADER = "signature-agent";
var REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT = [
  "@authority"
];
var REQUEST_COMPONENTS = [
  "@authority",
  SIGNATURE_AGENT_HEADER
];
var NONCE_LENGTH_IN_BYTES = 64;
function generateNonce() {
  const nonceBytes = new Uint8Array(NONCE_LENGTH_IN_BYTES);
  crypto.getRandomValues(nonceBytes);
  return u8ToB64(nonceBytes);
}
function validateNonce(nonce) {
  try {
    return b64Tou8(nonce).length === NONCE_LENGTH_IN_BYTES;
  } catch {
    return false;
  }
}
function signatureHeaders2(message, signer, params) {
  if (params.created.getTime() > params.expires.getTime()) {
    throw new Error("created should happen before expires");
  }
  let nonce = params.nonce;
  if (!nonce) {
    nonce = generateNonce();
  } else {
    if (!validateNonce(nonce)) {
      throw new Error("nonce is not a valid uint32");
    }
  }
  const signatureAgent = httpsig.extractHeader(message, SIGNATURE_AGENT_HEADER);
  let components = REQUEST_COMPONENTS;
  if (!signatureAgent) {
    components = REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT;
  }
  return httpsig.signatureHeaders(message, {
    signer,
    components,
    created: params.created,
    expires: params.expires,
    nonce,
    keyid: signer.keyid,
    key: params.key,
    tag: HTTP_MESSAGE_SIGNAGURE_TAG
  });
}
function signatureHeadersSync2(message, signer, params) {
  if (params.created.getTime() > params.expires.getTime()) {
    throw new Error("created should happen before expires");
  }
  let nonce = params.nonce;
  if (!nonce) {
    nonce = generateNonce();
  } else {
    if (!validateNonce(nonce)) {
      throw new Error("nonce is not a valid uint32");
    }
  }
  const signatureAgent = httpsig.extractHeader(message, SIGNATURE_AGENT_HEADER);
  let components = REQUEST_COMPONENTS;
  if (!signatureAgent) {
    components = REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT;
  }
  return httpsig.signatureHeadersSync(message, {
    signer,
    components,
    created: params.created,
    expires: params.expires,
    nonce,
    keyid: signer.keyid,
    tag: HTTP_MESSAGE_SIGNAGURE_TAG
  });
}
function verify2(message, verifier) {
  const v = (data, signature, params) => {
    if (params.tag !== HTTP_MESSAGE_SIGNAGURE_TAG) {
      throw new Error(`tag must be '${HTTP_MESSAGE_SIGNAGURE_TAG}'`);
    }
    if (params.created.getTime() > Date.now()) {
      throw new Error("created in the future");
    }
    if (params.expires.getTime() < Date.now()) {
      throw new Error("signature has expired");
    }
    if (params.keyid === void 0) {
      throw new Error("keyid MUST be defined");
    }
    const vparams = {
      keyid: params.keyid,
      created: params.created,
      expires: params.expires,
      tag: params.tag,
      nonce: params.nonce
    };
    return verifier(data, signature, vparams);
  };
  return httpsig.verify(message, v);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HTTP_MESSAGE_SIGNAGURE_TAG,
  HTTP_MESSAGE_SIGNATURES_DIRECTORY,
  MediaType,
  NONCE_LENGTH_IN_BYTES,
  REQUEST_COMPONENTS,
  REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT,
  SIGNATURE_AGENT_HEADER,
  Tag,
  directoryResponseHeaders,
  generateNonce,
  helpers,
  jwkToKeyID,
  signatureHeaders,
  signatureHeadersSync,
  validateNonce,
  verify
});
