export function encode(u: Uint8Array): string {
  return btoa(String.fromCharCode(...u));
}

export function decode(b: string): Uint8Array {
  return Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
}
