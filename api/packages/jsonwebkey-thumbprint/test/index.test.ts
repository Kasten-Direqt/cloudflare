import { describe, it, expect } from "vitest";
import { jwkThumbprint } from "../src";
import vectors from "./fixtures/vectors.json";

const hex_decode = (s: string) =>
  Uint8Array.from(s.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

const u8ToB64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));

const b64ToB64URL = (s: string) => s.replace(/\+/g, "-").replace(/\//g, "_");

const b64ToB64NoPadding = (s: string) => s.replace(/=/g, "");

const tests = vectors.map((v) => ({
  ...v,
  jwk: JSON.parse(v.jwk) as JsonWebKey,
  precompute: hex_decode(v.precompute),
  sha256: hex_decode(v.sha256),
}));

// Tests for parsing
describe("Parsing", () => {
  const hash = (b: BufferSource) => crypto.subtle.digest("SHA-256", b);
  const decode = (u: ArrayBuffer) =>
    b64ToB64URL(b64ToB64NoPadding(u8ToB64(new Uint8Array(u))));

  tests.forEach(({ name, jwk: input, thumbprint: expected }) => {
    it(`should correctly compute thumbprint for ${name}`, async () => {
      const result = await jwkThumbprint(input, hash, decode);
      expect(result).toBe(expected);
    });
  });
});
