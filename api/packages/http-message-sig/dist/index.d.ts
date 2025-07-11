declare function encode(u: Uint8Array): string;
declare function decode(b: string): Uint8Array;

declare const base64_decode: typeof decode;
declare const base64_encode: typeof encode;
declare namespace base64 {
  export { base64_decode as decode, base64_encode as encode };
}

type Algorithm = "rsa-pss-sha512" | "rsa-v1_5-sha256" | "hmac-sha256" | "ecdsa-p256-sha256" | "ecdsa-p384-sha384" | "ed25519";
interface Signer {
    sign: (data: string) => Uint8Array | Promise<Uint8Array>;
    keyid: string;
    alg: Algorithm;
}
interface SignerSync {
    signSync: (data: string) => Uint8Array;
    keyid: string;
    alg: Algorithm;
}
type Verify<T> = (data: string, signature: Uint8Array, params: Parameters) => T | Promise<T>;
interface HeadersMap {
    get(name: string): string | null;
    set(name: string, value: string): void;
}
type Headers = Record<string, HeaderValue> | HeadersMap;
type HeaderValue = {
    toString(): string;
} | string | string[];
interface RequestLike {
    method: string;
    url: string;
    protocol?: string;
    headers: Headers;
}
interface ResponseLike {
    status: number;
    headers: Headers;
}
type Parameter = "created" | "expires" | "nonce" | "alg" | "keyid" | string;
type Component = "@method" | "@target-uri" | "@authority" | "@scheme" | "@request-target" | "@path" | "@query" | "@query-param" | "@status" | "@request-response" | string;
interface StandardParameters {
    expires?: Date;
    created?: Date;
    nonce?: string;
    alg?: string;
    keyid?: string;
    tag?: string;
}
type Parameters = StandardParameters & Record<Parameter, string | number | true | Date | {
    [Symbol.toStringTag]: () => string;
}>;
type SignOptions = StandardParameters & {
    components?: Component[];
    key?: string;
    signer: Signer;
    [name: Parameter]: Component[] | Signer | string | number | true | Date | {
        [Symbol.toStringTag]: () => string;
    } | undefined;
};
type SignSyncOptions = StandardParameters & {
    components?: Component[];
    key?: string;
    signer: SignerSync;
    [name: Parameter]: Component[] | SignerSync | string | number | true | Date | {
        [Symbol.toStringTag]: () => string;
    } | undefined;
};
interface SignatureHeaders {
    Signature: string;
    "Signature-Input": string;
}
interface Directory {
    keys: JsonWebKey[];
}

declare function extractHeader({ headers }: RequestLike | ResponseLike, header: string): string;

declare const HTTP_MESSAGE_SIGNATURES_DIRECTORY = "/.well-known/http-message-signatures-directory";
declare enum MediaType {
    HTTP_MESSAGE_SIGNATURES_DIRECTORY = "application/http-message-signatures-directory+json"
}
declare enum Tag {
    HTTP_MESSAGE_SIGNAGURES_DIRECTORY = "http-message-signatures-directory"
}

declare const RESPONSE_COMPONENTS: Component[];
interface SignatureParams {
    created: Date;
    expires: Date;
}
declare function directoryResponseHeaders<T1 extends RequestLike>(request: T1, // request is used to derive @authority for the response
signers: Signer[], params: SignatureParams): Promise<SignatureHeaders>;

declare function parseAcceptSignatureHeader(header: HeaderValue): {
    key: string;
    components: Component[];
    parameters: Parameters;
};

declare function signatureHeaders<T extends RequestLike | ResponseLike>(message: T, opts: SignOptions): Promise<SignatureHeaders>;
declare function signatureHeadersSync<T extends RequestLike | ResponseLike>(message: T, opts: SignSyncOptions): SignatureHeaders;

declare function verify<T>(message: RequestLike | ResponseLike, verifier: Verify<T>): Promise<T>;

export { type Algorithm, type Component, type Directory, HTTP_MESSAGE_SIGNATURES_DIRECTORY, type HeaderValue, MediaType, type Parameter, type Parameters, RESPONSE_COMPONENTS, type RequestLike, type ResponseLike, type SignOptions, type SignSyncOptions, type SignatureHeaders, type SignatureParams, type Signer, type SignerSync, Tag, type Verify, base64, directoryResponseHeaders, extractHeader, parseAcceptSignatureHeader as parseAcceptSignature, signatureHeaders, signatureHeadersSync, verify };
