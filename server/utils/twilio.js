/**
 * Twilio SMS Service
 * Handles sending SMS messages via Twilio API
 */

import twilio from "twilio";

let twilioClient = null;

/**
 * Initialize Twilio client
 */
export function initializeTwilio() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("⚠️ TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set. SMS functionality will be disabled.");
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    // Twilio client initialized
    return twilioClient;
  } catch (error) {
    console.error("❌ Error initializing Twilio:", error.message);
    return null;
  }
}

/**
 * Get Twilio client (initialize if needed)
 */
function getTwilioClient() {
  if (!twilioClient) {
    return initializeTwilio();
  }
  return twilioClient;
}

/**
 * Send SMS message to a single phone number
 * @param {string} to - Phone number to send to (E.164 format)
 * @param {string} message - Message text
 * @returns {Promise<Object>} Twilio message object with SID and status
 */
export async function sendSMS(to, message) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error("TWILIO_PHONE_NUMBER not set");
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: from,
      to: to,
    });

    // Twilio can return a success response even with warnings/errors in the console
    // We need to fetch the message status immediately to check for warnings/errors
    // that might not be in the initial response
    let messageStatus = result;
    
    // Wait a moment for Twilio to process the message, then fetch the latest status
    // This helps catch warnings/errors (like 30032) that appear after message creation
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      messageStatus = await client.messages(result.sid).fetch();
    } catch (fetchError) {
      // If fetch fails, use the original result
      console.warn("Could not fetch message status, using initial response:", fetchError.message);
    }

    // Check the fetched status for errors/warnings
    const status = messageStatus.status?.toLowerCase();
    const errorCode = messageStatus.errorCode;
    const errorMessage = messageStatus.errorMessage;

    // Failure statuses or error codes indicate the message didn't actually succeed
    const failureStatuses = ['failed', 'undelivered', 'canceled', 'canceled', 'rejected'];
    // Any non-null errorCode means there's an issue (warnings are also error codes)
    const hasError = errorCode !== null && errorCode !== undefined && errorCode !== 0;
    const isFailed = failureStatuses.includes(status) || hasError;
    
    if (isFailed) {
      // Message API call succeeded, but message itself failed or has warnings
      let userMessage = errorMessage || (errorCode ? `Twilio error code: ${errorCode}` : "Message failed to send");
      
      // Provide user-friendly error messages for common issues
      if (errorCode === 30032 || errorCode === "30032") {
        userMessage = "Toll-Free number verification required. Please verify your phone number in Twilio Console.";
      } else if (errorCode === 21211 || errorCode === "21211") {
        userMessage = "Invalid phone number format. Please check the recipient's phone number.";
      } else if (errorCode === 21610 || errorCode === "21610") {
        userMessage = "Unsubscribed recipient. This phone number has opted out of receiving messages.";
      } else if (errorCode === 21408 || errorCode === "21408") {
        userMessage = "Permission denied. Your Twilio account may need additional permissions.";
      }

      const enhancedError = new Error(userMessage);
      enhancedError.twilioError = {
        message: errorMessage,
        code: errorCode,
        status: status,
        moreInfo: errorCode ? `https://www.twilio.com/docs/errors/${errorCode}` : null,
      };
      enhancedError.code = errorCode;
      enhancedError.status = status;
      throw enhancedError;
    }

    return {
      sid: messageStatus.sid,
      status: messageStatus.status,
      to: messageStatus.to,
      from: messageStatus.from,
      dateCreated: messageStatus.dateCreated,
      dateSent: messageStatus.dateSent,
      errorCode: messageStatus.errorCode,
      errorMessage: messageStatus.errorMessage,
    };
  } catch (error) {
    console.error("Error sending SMS:", error);
    
    // Extract detailed error information from Twilio
    const twilioError = {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo,
    };

    // Provide user-friendly error messages for common issues
    let userMessage = error.message;
    if (error.code === 30032) {
      userMessage = "Toll-Free number verification required. Please verify your phone number in Twilio Console.";
    } else if (error.code === 21211) {
      userMessage = "Invalid phone number format. Please check the recipient's phone number.";
    } else if (error.code === 21610) {
      userMessage = "Unsubscribed recipient. This phone number has opted out of receiving messages.";
    } else if (error.code === 21408) {
      userMessage = "Permission denied. Your Twilio account may need additional permissions.";
    }

    const enhancedError = new Error(userMessage);
    enhancedError.twilioError = twilioError;
    enhancedError.code = error.code;
    throw enhancedError;
  }
}

/**
 * Send SMS to multiple recipients
 * @param {string[]} phoneNumbers - Array of phone numbers (E.164 format)
 * @param {string} message - Message text
 * @returns {Promise<Array>} Array of results for each recipient
 */
export async function sendBulkSMS(phoneNumbers, message) {
  const results = [];
  
  // Send messages sequentially to avoid rate limits
  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendSMS(phoneNumber, message);
      results.push({
        phoneNumber,
        success: true,
        ...result,
      });
    } catch (error) {
      results.push({
        phoneNumber,
        success: false,
        error: error.message,
        errorCode: error.code,
        twilioError: error.twilioError,
      });
    }
  }

  return results;
}

/**
 * Get message status from Twilio
 * @param {string} messageSid - Twilio message SID
 * @returns {Promise<Object>} Message status information
 */
export async function getMessageStatus(messageSid) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized");
  }

  try {
    const message = await client.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error("Error fetching message status:", error);
    throw new Error(`Failed to fetch message status: ${error.message}`);
  }
}

/**
 * Fetch SMS history from Twilio
 * @param {Object} options - Query options { limit, dateSentAfter, dateSentBefore }
 * @returns {Promise<Array>} Array of message objects
 */
export async function getSMSHistory(options = {}) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized");
  }

  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.dateSentAfter) queryParams.dateSentAfter = new Date(options.dateSentAfter);
    if (options.dateSentBefore) queryParams.dateSentBefore = new Date(options.dateSentBefore);

    const messages = await client.messages.list(queryParams);
    
    return messages.map((msg) => ({
      sid: msg.sid,
      status: msg.status,
      to: msg.to,
      from: msg.from,
      body: msg.body,
      dateCreated: msg.dateCreated,
      dateSent: msg.dateSent,
      dateUpdated: msg.dateUpdated,
      errorCode: msg.errorCode,
      errorMessage: msg.errorMessage,
      direction: msg.direction,
      price: msg.price,
      priceUnit: msg.priceUnit,
    }));
  } catch (error) {
    console.error("Error fetching SMS history:", error);
    throw new Error(`Failed to fetch SMS history: ${error.message}`);
  }
}

/**
 * Calculate SMS segments based on message length
 * @param {string} message - Message text
 * @returns {number} Number of segments
 */
export function calculateSMSSegments(message) {
  if (!message) return 1;
  
  // GSM-7 encoding: 160 characters per segment
  // UCS-2 encoding (for special characters): 70 characters per segment
  const hasSpecialChars = /[^\x00-\x7F]/.test(message);
  const charsPerSegment = hasSpecialChars ? 70 : 160;
  
  return Math.ceil(message.length / charsPerSegment);
}

