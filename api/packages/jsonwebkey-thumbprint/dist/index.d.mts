declare const jwkThumbprintPreCompute: (jwk: JsonWebKey) => Uint8Array;
declare const jwkThumbprint: (jwk: JsonWebKey, hash: (b: BufferSource) => Promise<ArrayBuffer>, decode: (s: ArrayBuffer) => string) => Promise<string>;

export { jwkThumbprint, jwkThumbprintPreCompute };
