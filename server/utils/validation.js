/**
 * Validation utilities for member data
 */

// Phone number validation - accepts international formats
// Allows: +1 234 567 8900, (123) 456-7890, 123-456-7890, 1234567890, etc.
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitize string input - remove leading/trailing whitespace and normalize
 */
export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/\s+/g, " ");
}

/**
 * Normalize phone number - remove common formatting characters, keep only digits and +
 * Stores phones in database as normalized (e.g., "7325514480")
 */
export function normalizePhone(phone) {
  if (!phone) return "";
  // Convert to string if not already
  const phoneStr = typeof phone === "string" ? phone : String(phone);
  // Remove spaces, dashes, parentheses, dots, but keep + and digits
  return phoneStr.trim().replace(/[\s\-\(\)\.]/g, "");
}

/**
 * Format phone number for display - adds dashes for US numbers
 * Displays phones formatted (e.g., "732-551-4480")
 */
export function formatPhoneForDisplay(phone) {
  if (!phone) return "";
  const normalized = normalizePhone(phone);
  if (!normalized) return "";
  
  // Format US 10-digit numbers: XXX-XXX-XXXX
  // Format US 11-digit numbers with country code: +X XXX-XXX-XXXX
  if (normalized.length === 10 && /^\d{10}$/.test(normalized)) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  } else if (normalized.length === 11 && normalized.startsWith("1") && /^1\d{10}$/.test(normalized)) {
    return `+1 ${normalized.slice(1, 4)}-${normalized.slice(4, 7)}-${normalized.slice(7)}`;
  } else if (normalized.length > 10 && normalized.startsWith("+")) {
    // International format: keep + and add space after country code if appropriate
    return normalized;
  }
  
  // For other formats, return normalized (no formatting)
  return normalized;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {Object} { valid: boolean, normalized: string, error: string }
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== "string") {
    return { valid: false, normalized: "", error: "Phone number is required" };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: false, normalized: "", error: "Phone number cannot be empty" };
  }

  const normalized = normalizePhone(trimmed);
  
  // Must have at least 10 digits (or 11 with country code)
  const digitCount = normalized.replace(/\+/g, "").length;
  if (digitCount < 10) {
    return { valid: false, normalized, error: "Phone number must contain at least 10 digits" };
  }

  if (digitCount > 15) {
    return { valid: false, normalized, error: "Phone number is too long (maximum 15 digits)" };
  }

  // Test against regex
  if (!PHONE_REGEX.test(trimmed)) {
    return { valid: false, normalized, error: "Invalid phone number format" };
  }

  return { valid: true, normalized, error: null };
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, normalized: string, error: string }
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, normalized: "", error: "Email is required" };
  }

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, normalized: "", error: "Email cannot be empty" };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, normalized: trimmed, error: "Invalid email format" };
  }

  // Check length limits
  if (trimmed.length > 254) {
    return { valid: false, normalized: trimmed, error: "Email is too long (maximum 254 characters)" };
  }

  return { valid: true, normalized: trimmed, error: null };
}

/**
 * Validate and sanitize member data
 * @param {Object} memberData - Member data to validate
 * @param {Object} options - Options { skipDuplicates: boolean, existingEmails: Array, existingPhones: Array }
 * @returns {Object} { valid: boolean, errors: Array, sanitized: Object }
 */
export function validateMemberData(memberData, options = {}) {
  const errors = [];
  const sanitized = {
    name: sanitizeString(memberData.name || ""),
    firstName: sanitizeString(memberData.firstName || ""),
    lastName: sanitizeString(memberData.lastName || ""),
    emails: [],
    phones: [],
  };

  // Validate name (optional, kept for backward compatibility)
  // Only validate name if firstName/lastName are not provided (new schema)
  const hasFirstNameOrLastName = sanitized.firstName || sanitized.lastName;
  // Only validate name field if it was explicitly provided (not undefined/null) AND firstName/lastName are not provided
  if (!hasFirstNameOrLastName && memberData.name !== undefined && memberData.name !== null && sanitized.name === "") {
    errors.push({ field: "name", message: "Name cannot be empty if provided" });
  }
  
  // Don't require name if firstName or lastName are provided
  // The validation above already handles this, but we ensure name is not required when firstName/lastName exist
  
  // Validate first/last name (optional, but at least firstName is recommended)
  // If both are provided, last name is required for sorting
  if (memberData.firstName !== undefined && sanitized.firstName === "" && sanitized.lastName !== "") {
    errors.push({ field: "firstName", message: "First name cannot be empty if last name is provided" });
  }

  // Validate emails
  const emailArray = memberData.emails || (memberData.email ? [memberData.email] : []);
  const existingEmails = options.existingEmails || [];

  for (let i = 0; i < emailArray.length; i++) {
    const email = emailArray[i];
    if (!email || typeof email !== "string" || !email.trim()) {
      continue; // Skip empty emails
    }

    const validation = validateEmail(email);
    if (!validation.valid) {
      errors.push({ field: `email[${i}]`, message: validation.error, value: email });
      continue;
    }

    // Check for duplicates within the member's own emails
    if (sanitized.emails.includes(validation.normalized)) {
      errors.push({ field: `email[${i}]`, message: "Duplicate email in the same member", value: email });
      continue;
    }

    // Check for duplicates with existing members (if not skipped)
    if (!options.skipDuplicates && existingEmails.includes(validation.normalized)) {
      errors.push({ field: `email[${i}]`, message: "This email already exists in the group", value: email });
      continue;
    }

    sanitized.emails.push(validation.normalized);
  }

  // Validate phones
  const phoneArray = memberData.phones || (memberData.phone ? [memberData.phone] : []);
  const existingPhones = options.existingPhones || [];

  for (let i = 0; i < phoneArray.length; i++) {
    const phone = phoneArray[i];
    if (!phone || typeof phone !== "string" || !phone.trim()) {
      continue; // Skip empty phones
    }

    const validation = validatePhone(phone);
    if (!validation.valid) {
      errors.push({ field: `phone[${i}]`, message: validation.error, value: phone });
      continue;
    }

    // Check for duplicates within the member's own phones
    if (sanitized.phones.includes(validation.normalized)) {
      errors.push({ field: `phone[${i}]`, message: "Duplicate phone number in the same member", value: phone });
      continue;
    }

    // Check for duplicates with existing members (if not skipped)
    if (!options.skipDuplicates && existingPhones.includes(validation.normalized)) {
      errors.push({ field: `phone[${i}]`, message: "This phone number already exists in the group", value: phone });
      continue;
    }

    sanitized.phones.push(validation.normalized);
  }

  // Require either email OR phone (at least one), but name is optional
  if (sanitized.emails.length === 0 && sanitized.phones.length === 0) {
    errors.push({ field: "general", message: "At least one email or phone number is required" });
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

