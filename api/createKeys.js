// based on code here
// https://github.com/cloudflare/web-bot-auth/tree/main/packages/jsonwebkey-thumbprint

const { jwkThumbprint } = require("jsonwebkey-thumbprint");
const fs = require('fs');
const path = require('path');
const os = require("os");

const u8ToB64 = (u) => btoa(String.fromCharCode(...u));

const b64ToB64URL = (s) => s.replace(/\+/g, "-").replace(/\//g, "_");

const b64ToB64NoPadding = (s) => s.replace(/=/g, "");

// https://stackoverflow.com/a/65001580/30940603
function setEnvValue(key, value) {
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));
    ENV_VARS.splice(target, 1, `${key}=${value}`);
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

const hash = (b) => crypto.subtle.digest("SHA-256", b);
const decode = (u) =>
  b64ToB64URL(b64ToB64NoPadding(u8ToB64(new Uint8Array(u))));

async function generateAndSaveKeys() {
  try {
    const keypair = await crypto.subtle.generateKey("Ed25519", true, [
      "sign",
      "verify",
    ]);

    const publicJwk = await crypto.subtle.exportKey("jwk", keypair.publicKey);
    const privateJwk = await crypto.subtle.exportKey("jwk", keypair.privateKey);

    const thumbprint = await jwkThumbprint(publicJwk, hash, decode);
    console.log(`Generated key with thumbprint: ${thumbprint}`);

    publicJwk.kid = thumbprint;
    privateJwk.kid = thumbprint;

    fs.writeFileSync(
      path.resolve(process.cwd(), 'publicKey.json'),
      JSON.stringify(publicJwk, null, 2)
    );
    console.log('Public key saved to publicKey.json');

    fs.writeFileSync(
      path.resolve(process.cwd(), 'privateKey.json'),
      JSON.stringify(privateJwk, null, 2)
    );
    console.log('Private key saved to privateKey.json');

    setEnvValue('PRIVATE_D', privateJwk.d);
    console.log('.env file updated with PRIVATE_D');

    return { publicJwk, privateJwk, thumbprint };
  } catch (error) {
    console.error('Error generating keys:', error);
    throw error;
  }
}

generateAndSaveKeys();