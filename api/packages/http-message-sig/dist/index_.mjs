var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/base64.ts
var base64_exports = {};
__export(base64_exports, {
  decode: () => decode,
  encode: () => encode
});
function encode(u) {
  return btoa(String.fromCharCode(...u));
}
function decode(b) {
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}

// src/build.ts
function extractHeader({ headers }, header) {
  if (typeof headers.get === "function") return headers.get(header) ?? "";
  const lcHeader = header.toLowerCase();
  const key = Object.keys(headers).find(
    (name) => name.toLowerCase() === lcHeader
  );
  let val = key ? headers[key] ?? "" : "";
  if (Array.isArray(val)) {
    val = val.join(", ");
  }
  return val.toString().replace(/\s+/g, " ");
}
function getUrl(message, component) {
  if ("url" in message && "protocol" in message) {
    const host = extractHeader(message, "host");
    const protocol = message.protocol || "http";
    const baseUrl = `${protocol}://${host}`;
    return new URL(message.url, baseUrl);
  }
  if (!message.url)
    throw new Error(`${component} is only valid for requests`);
  return new URL(message.url);
}
function extractComponent(message, component) {
  switch (component) {
    case "@method":
      if (!message.method)
        throw new Error(`${component} is only valid for requests`);
      return message.method.toUpperCase();
    case "@target-uri":
      if (!message.url)
        throw new Error(`${component} is only valid for requests`);
      return message.url;
    case "@authority": {
      const url = getUrl(message, component);
      const port = url.port ? parseInt(url.port, 10) : null;
      return `${url.hostname}${port && ![80, 443].includes(port) ? `:${port}` : ""}`;
    }
    case "@scheme":
      return getUrl(message, component).protocol.slice(0, -1);
    case "@request-target": {
      const { pathname, search } = getUrl(message, component);
      return `${pathname}${search}`;
    }
    case "@path":
      return getUrl(message, component).pathname;
    case "@query":
      return getUrl(message, component).search;
    case "@status":
      if (!message.status)
        throw new Error(`${component} is only valid for responses`);
      return message.status.toString();
    case "@query-params":
    case "@request-response":
      throw new Error(`${component} is not implemented yet`);
    default:
      throw new Error(`Unknown specialty component ${component}`);
  }
}
function buildSignatureInputString(componentNames, parameters) {
  const components = componentNames.map((name) => `"${name.toLowerCase()}"`).join(" ");
  const values = Object.entries(parameters).map(([parameter, value]) => {
    if (typeof value === "number") return `;${parameter}=${value}`;
    if (value instanceof Date)
      return `;${parameter}=${Math.floor(value.getTime() / 1e3)}`;
    return `;${parameter}="${value.toString()}"`;
  }).join("");
  return `(${components})${values}`;
}
function buildSignedData(request, components, signatureInputString) {
  const parts = components.map((component) => {
    const value = component.startsWith("@") ? extractComponent(request, component) : extractHeader(request, component);
    return `"${component.toLowerCase()}": ${value}`;
  });
  parts.push(`"@signature-params": ${signatureInputString}`);
  return parts.join("\n");
}

// src/consts.ts
var HTTP_MESSAGE_SIGNATURES_DIRECTORY = "/.well-known/http-message-signatures-directory";
var MediaType = /* @__PURE__ */ ((MediaType2) => {
  MediaType2["HTTP_MESSAGE_SIGNATURES_DIRECTORY"] = "application/http-message-signatures-directory+json";
  return MediaType2;
})(MediaType || {});
var Tag = /* @__PURE__ */ ((Tag2) => {
  Tag2["HTTP_MESSAGE_SIGNAGURES_DIRECTORY"] = "http-message-signatures-directory";
  return Tag2;
})(Tag || {});

// src/sign.ts
var defaultRequestComponents = [
  "@method",
  "@path",
  "@query",
  "@authority",
  "content-type",
  "digest"
];
var defaultResponseComponents = [
  "@status",
  "content-type",
  "digest"
];
async function signatureHeaders(message, opts) {
  const { signer, components: _components, key: _key, ...params } = opts;
  const components = _components ?? ("status" in message ? defaultResponseComponents : defaultRequestComponents);
  const key = _key ?? "sig1";
  const signParams = {
    created: /* @__PURE__ */ new Date(),
    keyid: signer.keyid,
    alg: signer.alg,
    ...params
  };
  const signatureInputString = buildSignatureInputString(
    components,
    signParams
  );
  const dataToSign = buildSignedData(message, components, signatureInputString);
  console.log("Data to sign (async):", dataToSign);
  const signature = await signer.sign(dataToSign);
  const sigBase64 = encode(signature);
  return {
    Signature: `${key}=:${sigBase64}:`,
    "Signature-Input": `${key}=${signatureInputString}`
  };
}
function signatureHeadersSync(message, opts) {
  const { signer, components: _components, key: _key, ...params } = opts;
  const components = _components ?? ("status" in message ? defaultResponseComponents : defaultRequestComponents);
  const key = _key ?? "sig1";
  const signParams = {
    created: /* @__PURE__ */ new Date(),
    keyid: signer.keyid,
    alg: signer.alg,
    ...params
  };
  const signatureInputString = buildSignatureInputString(
    components,
    signParams
  );
  const dataToSign = buildSignedData(message, components, signatureInputString);
  console.log("Data to sign (sync):", dataToSign);
  const signature = signer.signSync(dataToSign);
  const sigBase64 = encode(signature);
  return {
    Signature: `${key}=:${sigBase64}:`,
    "Signature-Input": `${key}=${signatureInputString}`
  };
}

// src/directory.ts
var RESPONSE_COMPONENTS = ["@authority"];
async function directoryResponseHeaders(request, signers, params) {
  if (params.created.getTime() > params.expires.getTime()) {
    throw new Error("created should happen before expires");
  }
  const components = RESPONSE_COMPONENTS;
  const headers = /* @__PURE__ */ new Map();
  for (let i = 0; i < signers.length; i += 1) {
    const signer = signers[i];
    if (headers.has(signer.keyid)) {
      throw new Error(`Duplicated signer with keyid ${signer.keyid}`);
    }
    headers.set(
      signer.keyid,
      await signatureHeaders(request, {
        signer,
        components,
        created: params.created,
        expires: params.expires,
        keyid: signer.keyid,
        key: `binding${i}`,
        tag: "http-message-signatures-directory" /* HTTP_MESSAGE_SIGNAGURES_DIRECTORY */
      })
    );
  }
  const SF_SEPARATOR = ", ";
  return {
    Signature: Array.from(headers.values()).map((h) => h.Signature).join(SF_SEPARATOR),
    "Signature-Input": Array.from(headers.values()).map((h) => h["Signature-Input"]).join(SF_SEPARATOR)
  };
}

// src/parse.ts
function parseEntry(headerName, entry) {
  const equalsIndex = entry.indexOf("=");
  if (equalsIndex === -1) {
    return [entry.trim(), true];
  }
  const key = entry.slice(0, equalsIndex);
  const value = entry.slice(equalsIndex + 1).trim();
  if (key.length === 0) {
    throw new Error(`Invalid ${headerName} header. Invalid value ${entry}`);
  }
  if (value.match(/^".*"$/)) return [key.trim(), value.slice(1, -1)];
  if (value.match(/^\d+$/)) return [key.trim(), parseInt(value)];
  if (value.match(/^\(.*\)$/)) {
    const arr = value.slice(1, -1).split(/\s+/).map((entry2) => {
      var _a;
      return ((_a = entry2.match(/^"(.*)"$/)) == null ? void 0 : _a[1]) ?? parseInt(entry2);
    });
    if (arr.some((value2) => typeof value2 === "number" && isNaN(value2))) {
      throw new Error(
        `Invalid ${headerName} header. Invalid value ${key}=${value}`
      );
    }
    return [key.trim(), arr];
  }
  throw new Error(
    `Invalid ${headerName} header. Invalid value ${key}=${value}`
  );
}
function parseParametersHeader(name, header) {
  var _a;
  const entries = (_a = header.toString().match(/(?:[^;"]+|"[^"]+")+/g)) == null ? void 0 : _a.map((entry) => parseEntry(name, entry.trim()));
  if (!entries) throw new Error(`Invalid ${name} header. Invalid value`);
  const componentsIndex = entries.findIndex(
    ([, value]) => Array.isArray(value)
  );
  if (componentsIndex === -1)
    throw new Error(`Invalid ${name} header. Missing components`);
  const [[key, components]] = entries.splice(componentsIndex, 1);
  if (entries.some(([, value]) => Array.isArray(value))) {
    throw new Error(`Multiple signatures is not supported`);
  }
  const parameters = Object.fromEntries(entries);
  if (typeof parameters.created === "number")
    parameters.created = new Date(parameters.created * 1e3);
  if (typeof parameters.expires === "number")
    parameters.expires = new Date(parameters.expires * 1e3);
  return { key, components, parameters };
}
function parseSignatureInputHeader(header) {
  return parseParametersHeader("Signature-Input", header);
}
function parseAcceptSignatureHeader(header) {
  return parseParametersHeader("Accept-Signature", header);
}
function parseSignatureHeader(key, header) {
  const signatureMatch = header.toString().match(/^([\w-]+)=:([A-Za-z0-9+/=]+):$/);
  if (!signatureMatch) throw new Error("Invalid Signature header");
  const [, signatureKey, signature] = signatureMatch;
  if (signatureKey !== key)
    throw new Error(
      `Invalid Signature header. Key mismatch ${signatureKey} !== ${key}`
    );
  return decode(signature);
}

// src/verify.ts
async function verify(message, verifier) {
  const signatureInputHeader = extractHeader(message, "signature-input");
  if (!signatureInputHeader)
    throw new Error("Message does not contain Signature-Input header");
  const { key, components, parameters } = parseSignatureInputHeader(signatureInputHeader);
  if (parameters.expires && parameters.expires < /* @__PURE__ */ new Date())
    throw new Error("Signature expired");
  const signatureHeader = extractHeader(message, "signature");
  if (!signatureHeader)
    throw new Error("Message does not contain Signature header");
  const signature = parseSignatureHeader(key, signatureHeader);
  const signatureInputString = signatureInputHeader.toString().replace(/^[^=]+=/, "");
  const signedData = buildSignedData(message, components, signatureInputString);
  return verifier(signedData, signature, parameters);
}
export {
  HTTP_MESSAGE_SIGNATURES_DIRECTORY,
  MediaType,
  RESPONSE_COMPONENTS,
  Tag,
  base64_exports as base64,
  directoryResponseHeaders,
  extractHeader,
  parseAcceptSignatureHeader as parseAcceptSignature,
  signatureHeaders,
  signatureHeadersSync,
  verify
};
