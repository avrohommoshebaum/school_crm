/**
 * CSP Nonce Middleware
 * Generates a unique nonce per request for Content Security Policy
 */

import crypto from "crypto";

/**
 * Generate a nonce and attach it to the request object
 * The nonce will be used in CSP headers and injected into HTML
 */
export function generateNonce(req, res, next) {
  // Generate a random 16-byte nonce and encode as base64
  const nonce = crypto.randomBytes(16).toString("base64");
  
  // Attach to request for use in CSP header
  req.nonce = nonce;
  
  // Also attach to res.locals for template rendering (if needed)
  res.locals.nonce = nonce;
  
  next();
}

/**
 * Get the nonce from the request
 * Used by other middleware to access the nonce
 */
export function getNonce(req) {
  return req.nonce || "";
}
