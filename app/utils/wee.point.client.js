// weePointsClient.js
const axios = require('axios');

const { WEEPOINTS_BASE_URL,WEEPOINTS_API_KEY,WEEPOINTS_ENDPOINT_PATH } = require("../constants/app_constants");
const ENDPOINT_PATH = '/weepoints/addWeePointsToUserWallet';


/**
 * Allowed reward types
 */
const ALLOWED_REWARD_TYPES = new Set(['social_post', 'social_interaction']);

/**
 * Simple email validation (sufficient for quick guard)
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // basic RFC-like check (not exhaustive)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Make request to add wee points to a user wallet.
 *
 * @param {Object} opts
 * @param {string} opts.email - user email (required)
 * @param {string} opts.rewardType - one of 'social_post' | 'social_interaction' (required)
 * @param {number} [opts.retries=2] - number of retry attempts on network/5xx errors
 * @param {number} [opts.timeout=5000] - axios request timeout in ms
 * @param {string} [opts.baseUrl] - override base URL
 * @param {string} [opts.apiKey] - override API key
 *
 * @returns {Promise<{ success: boolean, status?: number, data?: any, error?: string }>}
 */
async function addWeePointsToUserWallet({
  email,
  rewardType,
  retries = 2,
  timeout = 5000,
  baseUrl,
  apiKey
} = {}) {
  // Validate inputs
  if (!isValidEmail(email)) {
    return { success: false, error: 'Invalid email' };
  }
  if (!rewardType || !ALLOWED_REWARD_TYPES.has(rewardType)) {
    return { success: false, error: `Invalid rewardType. Allowed: ${Array.from(ALLOWED_REWARD_TYPES).join(', ')}` };
  }

  const url = (baseUrl || WEEPOINTS_BASE_URL).replace(/\/$/, '') + WEEPOINTS_ENDPOINT_PATH;
  const key = apiKey || WEEPOINTS_API_KEY;

  const payload = { email, rewardType };

  // axios instance
  const client = axios.create({
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key
    }
  });

  // Exponential backoff retry loop
  let attempt = 0;
  const maxAttempts = Math.max(1, retries + 1);
  while (attempt < maxAttempts) {
    try {
      const resp = await client.post(url, payload);
      // consider 2xx success
      if (resp && resp.status >= 200 && resp.status < 300) {
        return { success: true, status: resp.status, data: resp.data };
      }
      // non-2xx but no throw (rare with axios) - treat as failure
      return { success: false, status: resp.status, error: `Unexpected response status ${resp.status}` };
    } catch (err) {
      attempt += 1;
      const isLast = attempt >= maxAttempts;

      // Distinguish retryable errors: network errors or 5xx from server
      const status = err?.response?.status;
      const isServerError = status && status >= 500 && status < 600;
      const isNetworkError = !err.response; // timeout, network down, DNS, etc.

      // If not retryable or last attempt, return error
      if ((!isServerError && !isNetworkError) || isLast) {
        const message = err?.response?.data ? JSON.stringify(err.response.data) : (err.message || 'Unknown error');
        return { success: false, status: status, error: message };
      }

      // otherwise backoff then retry
      const backoffMs = Math.pow(2, attempt) * 200; // 400ms, 800ms, 1600ms ...
      await new Promise(r => setTimeout(r, backoffMs));
      continue;
    }
  }

  return { success: false, error: true, message: 'Retries exhausted' };
}

module.exports = { addWeePointsToUserWallet, ALLOWED_REWARD_TYPES };
