/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by sanitizing user input
 * Server-side implementation without DOM dependencies
 */

/**
 * Remove HTML tags and dangerous characters from string
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
function stripHTML(text) {
  if (!text || typeof text !== 'string') return '';
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  return sanitized;
}

/**
 * Sanitize text field - removes HTML and normalizes whitespace
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  // Remove HTML, then normalize whitespace
  const sanitized = stripHTML(text);
  return sanitized.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize HTML string - removes dangerous HTML/scripts
 * For server-side, we strip all HTML tags
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized plain text
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';
  return stripHTML(html);
}

/**
 * Sanitize all string fields in an object
 * @param {Object} data - Object with string fields
 * @param {Array<string>} fields - Fields to sanitize (if not provided, sanitizes all string values)
 * @returns {Object} - Object with sanitized fields
 */
export function sanitizeObject(data, fields = null) {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const fieldsToSanitize = fields || Object.keys(sanitized);
  
  for (const field of fieldsToSanitize) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeText(sanitized[field]);
    } else if (Array.isArray(sanitized[field])) {
      sanitized[field] = sanitized[field].map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    }
  }
  
  return sanitized;
}
