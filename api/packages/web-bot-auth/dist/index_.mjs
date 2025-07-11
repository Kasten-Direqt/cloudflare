import {
  b64Tou8,
  helpers,
  u8ToB64
} from "./chunk-VXDWK3MV.mjs";

// src/index.ts
import * as httpsig from "http-message-sig";
import {
  HTTP_MESSAGE_SIGNATURES_DIRECTORY,
  MediaType,
  Tag,
  directoryResponseHeaders
} from "http-message-sig";
import { jwkThumbprint } from "jsonwebkey-thumbprint";
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
export {
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
  jwkThumbprint as jwkToKeyID,
  signatureHeaders2 as signatureHeaders,
  signatureHeadersSync2 as signatureHeadersSync,
  validateNonce,
  verify2 as verify
};
