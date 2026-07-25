import {
  generateKeyPairSync,
  sign as signBytes,
  verify as verifyBytes,
} from "node:crypto";

const encoder = new TextEncoder();

function encode(value) {
  return Buffer.from(
    typeof value === "string" ? value : JSON.stringify(value),
  ).toString("base64url");
}

function decode(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

export function createIdentityAuthority() {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" });

  return {
    publicKey: publicKeyPem,
    sign(claims) {
      const now = Math.floor(Date.now() / 1000);
      const header = encode({ alg: "EdDSA", typ: "JWT" });
      const payload = encode({
        iss: "codebolt-miniapp-host",
        iat: now,
        exp: now + 60,
        ...claims,
      });
      const message = `${header}.${payload}`;
      const signature = signBytes(null, encoder.encode(message), privateKey);
      return `${message}.${signature.toString("base64url")}`;
    },
  };
}

export function verifyExecutionToken(token, publicKey, expectedAudience) {
  const [headerPart, payloadPart, signaturePart, extra] = token.split(".");
  if (!headerPart || !payloadPart || !signaturePart || extra) {
    throw new Error("INVALID_EXECUTION_TOKEN");
  }

  const header = decode(headerPart);
  if (header.alg !== "EdDSA") {
    throw new Error("INVALID_EXECUTION_ALGORITHM");
  }

  const message = `${headerPart}.${payloadPart}`;
  const valid = verifyBytes(
    null,
    encoder.encode(message),
    publicKey,
    Buffer.from(signaturePart, "base64url"),
  );
  if (!valid) {
    throw new Error("INVALID_EXECUTION_SIGNATURE");
  }

  const claims = decode(payloadPart);
  if (claims.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("EXECUTION_TOKEN_EXPIRED");
  }
  if (expectedAudience && claims.aud !== expectedAudience) {
    throw new Error("INVALID_EXECUTION_AUDIENCE");
  }
  return claims;
}
