/**
 * Client-side HTML Sanitization Utilities
 * Prevents XSS attacks by sanitizing user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string - removes dangerous HTML/scripts
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [], // No HTML tags allowed - plain text only
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text field - removes HTML and normalizes whitespace
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  // First sanitize HTML, then normalize whitespace
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return sanitized.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize all string fields in an object
 * @param data - Object with string fields
 * @param fields - Fields to sanitize (if not provided, sanitizes all string values)
 * @returns Object with sanitized fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  data: T,
  fields?: string[]
): T {
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
