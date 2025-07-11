// Helper functions
// Taken from https://gist.github.com/thibmeu/d49746a77b09a65807801e92a50cbba4
export function u8ToB64(u: Uint8Array) {
  return btoa(String.fromCharCode(...u));
}

export function b64Tou8(b: string) {
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}

export function b64ToB64URL(b: string) {
  return b.replace(/\+/g, "-").replace(/\//g, "_");
}

export function b64ToB64NoPadding(b: string) {
  return b.replace(/=/g, "");
}
