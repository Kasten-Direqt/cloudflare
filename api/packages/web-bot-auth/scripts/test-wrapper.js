// This is a wrapper to run the test.ts script
import { signatureHeaders } from "web-bot-auth";
import { signerFromJWK } from "web-bot-auth/crypto";

// Wrap the top-level await code in an async function
async function main() {
  // The following simple request is going to be signed
  const request = new Request("https://cloudflare-five-beta.vercel.app/.well-known/http-message-signatures-directory");

  // This is a testing-only private key/public key pair described in RFC 9421 Appendix B.1.4
  // Also available at https://github.com/cloudflareresearch/web-bot-auth/blob/main/examples/rfc9421-keys/ed25519.json
  const RFC_9421_ED25519_TEST_KEY = {
    kty: "OKP",
    crv: "Ed25519",
    kid: "test-key-ed25519",
    d: "n4Ni-HpISpVObnQMW0wOhCKROaIKqKtW_2ZYb2p9KcU",
    x: "JrQLj5P_89iXES9-vFgrIy29clF9CC_oPPsw3c5D0bs",
  };

  const now = new Date();
  const headers = await signatureHeaders(
    request,
    await signerFromJWK(RFC_9421_ED25519_TEST_KEY),
    {
      created: now,
      expires: new Date(now.getTime() + 300_000), // now + 5 min
    }
  );

  console.log("Signature Headers:", headers);

  // Et voila! Here is our signed request.
  const signedRequest = new Request("https://example.com", {
    headers: {
      Signature: headers["Signature"],
      "Signature-Input": headers["Signature-Input"],
    },
  });
  
  console.log("Signed Request:", signedRequest);
}

// Execute the main function
main().catch(console.error);
