import * as httpsig from 'http-message-sig';
import { Signer, Algorithm } from 'http-message-sig';
export { Algorithm, HTTP_MESSAGE_SIGNATURES_DIRECTORY, MediaType, SignatureHeaders, Signer, SignerSync, Tag, directoryResponseHeaders } from 'http-message-sig';
export { jwkThumbprint as jwkToKeyID } from 'jsonwebkey-thumbprint';

declare const HTTP_MESSAGE_SIGNAGURE_TAG = "web-bot-auth";
declare const SIGNATURE_AGENT_HEADER = "signature-agent";
declare const REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT: httpsig.Component[];
declare const REQUEST_COMPONENTS: httpsig.Component[];
declare const NONCE_LENGTH_IN_BYTES = 64;
interface SignatureParams {
    created: Date;
    expires: Date;
    nonce?: string;
    key?: string;
}
interface VerificationParams {
    keyid: string;
    created: Date;
    expires: Date;
    tag: typeof HTTP_MESSAGE_SIGNAGURE_TAG;
    nonce?: string;
}
declare function generateNonce(): string;
declare function validateNonce(nonce: string): boolean;
declare function signatureHeaders<T extends httpsig.RequestLike | httpsig.ResponseLike>(message: T, signer: httpsig.Signer, params: SignatureParams): Promise<httpsig.SignatureHeaders>;
declare function signatureHeadersSync<T extends httpsig.RequestLike | httpsig.ResponseLike>(message: T, signer: httpsig.SignerSync, params: SignatureParams): httpsig.SignatureHeaders;
type Verify<T> = (data: string, signature: Uint8Array, params: VerificationParams) => T | Promise<T>;
declare function verify<T>(message: httpsig.RequestLike | httpsig.ResponseLike, verifier: Verify<T>): Promise<T>;
interface Directory extends httpsig.Directory {
    purpose: string;
}

declare const helpers: {
    WEBCRYPTO_SHA256: (b: BufferSource) => Promise<ArrayBuffer>;
    BASE64URL_DECODE: (u: ArrayBuffer) => string;
};
declare class Ed25519Signer implements Signer {
    alg: Algorithm;
    keyid: string;
    private privateKey;
    constructor(keyid: string, privateKey: CryptoKey);
    static fromJWK(jwk: JsonWebKey): Promise<Ed25519Signer>;
    sign(data: string): Promise<Uint8Array>;
}
declare class RSAPSSSHA512Signer implements Signer {
    alg: Algorithm;
    keyid: string;
    private privateKey;
    constructor(keyid: string, privateKey: CryptoKey);
    static fromJWK(jwk: JsonWebKey): Promise<RSAPSSSHA512Signer>;
    sign(data: string): Promise<Uint8Array>;
}
declare function signerFromJWK(jwk: JsonWebKey): Promise<Signer>;
declare function verifier(key: CryptoKey): (data: string, signature: Uint8Array, params: VerificationParams) => Promise<void>;
declare function verifierFromJWK(jwk: JsonWebKey): Promise<Verify<void>>;

export { type Directory, Ed25519Signer as E, HTTP_MESSAGE_SIGNAGURE_TAG, NONCE_LENGTH_IN_BYTES, RSAPSSSHA512Signer as R, REQUEST_COMPONENTS, REQUEST_COMPONENTS_WITHOUT_SIGNATURE_AGENT, SIGNATURE_AGENT_HEADER, type SignatureParams, type VerificationParams, type Verify, verifierFromJWK as a, generateNonce, helpers, signerFromJWK as s, signatureHeaders, signatureHeadersSync, verifier as v, validateNonce, verify };
