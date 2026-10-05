import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { apiError } from "../utils/apiError.js";

const isProduction =
  process.env.NODE_ENV === "production" || process.env.RENDER === "true";
const csrfSecret =
  process.env.CSRF_SECRET ||
  (!isProduction ? process.env.ACCESS_TOKEN_SECRET : undefined);

if (isProduction && (!csrfSecret || Buffer.byteLength(csrfSecret) < 32)) {
  throw new Error("CSRF_SECRET must be set to at least 32 bytes in production.");
}

if (!csrfSecret) {
  throw new Error(
    "Set CSRF_SECRET or ACCESS_TOKEN_SECRET before starting the backend.",
  );
}

export const csrfCookieName = "csrfToken";
export const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/v1",
};

const signNonce = (nonce) =>
  createHmac("sha256", csrfSecret).update(nonce).digest("base64url");

export const createCsrfToken = () => {
  const nonce = randomBytes(32).toString("base64url");
  return `${nonce}.${signNonce(nonce)}`;
};

export const isValidCsrfToken = (cookieToken, headerToken) => {
  if (typeof cookieToken !== "string" || typeof headerToken !== "string") {
    return false;
  }

  const [nonce, signature, ...extraParts] = cookieToken.split(".");
  if (
    extraParts.length ||
    !/^[A-Za-z0-9_-]{43}$/.test(nonce || "") ||
    !/^[A-Za-z0-9_-]{43}$/.test(signature || "")
  ) {
    return false;
  }

  const expectedSignature = signNonce(nonce);
  const suppliedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  const tokenBuffersMatch =
    Buffer.byteLength(cookieToken) === Buffer.byteLength(headerToken) &&
    timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
  const signatureMatches =
    suppliedSignature.length === expectedSignatureBuffer.length &&
    timingSafeEqual(suppliedSignature, expectedSignatureBuffer);

  return tokenBuffersMatch && signatureMatches;
};

export const verifyCsrfToken = (req, res, next) => {
  if (
    !isValidCsrfToken(
      req.cookies?.[csrfCookieName],
      req.get("X-CSRF-Token"),
    )
  ) {
    return next(new apiError(403, "CSRF token is missing or invalid."));
  }

  return next();
};
