#!/usr/bin/env node

/**
 * Test Configuration & Utilities
 * Shared configuration and helper functions for all tests
 */

const http = require('http');
const https = require('https');

// Base configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:8001',
  apiVersion: '/api/v1',
  timeout: 10000,
  showFullResponse: process.env.SHOW_FULL_RESPONSE === 'true',
  verbose: process.env.VERBOSE === 'true',
};

// Store tokens for authenticated requests
const TOKENS = {
  client: null,
  videographer: null,
  videoeditor: null,
  admin: null,
};

// Color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Make HTTP request (supports both JSON and FormData)
 */
function makeRequest(method, path, data = null, formDataOrHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.baseUrl);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Check if data is FormData
    const isFormData = formDataOrHeaders && typeof formDataOrHeaders.pipe === 'function';
    
    let headers = {};
    let requestData = null;

    if (isFormData) {
      // Handle FormData
      headers = formDataOrHeaders.getHeaders();
      requestData = formDataOrHeaders;
    } else {
      // Handle regular data with custom headers
      headers = {
        'Content-Type': 'application/json',
        ...formDataOrHeaders,
      };
      requestData = data ? JSON.stringify(data) : null;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers,
      timeout: CONFIG.timeout,
    };

    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          };
          resolve(response);
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (isFormData) {
      // Pipe FormData to request
      requestData.pipe(req);
    } else if (requestData) {
      req.write(requestData);
      req.end();
    } else {
      req.end();
    }
  });
}

/**
 * Print test result
 */
function printTestResult(testName, passed, message = '', response = null) {
  const status = passed 
    ? `${COLORS.green}✓ PASS${COLORS.reset}` 
    : `${COLORS.red}✗ FAIL${COLORS.reset}`;
  
  console.log(`${status} ${testName}`);
  
  if (message) {
    console.log(`  ${COLORS.gray}${message}${COLORS.reset}`);
  }
  
  if (!passed && response && CONFIG.showFullResponse) {
    console.log(`  ${COLORS.yellow}Response:${COLORS.reset}`, JSON.stringify(response, null, 2));
  }
  
  if (CONFIG.verbose && response) {
    console.log(`  ${COLORS.blue}Status:${COLORS.reset} ${response.statusCode}`);
    if (response.body) {
      console.log(`  ${COLORS.blue}Body:${COLORS.reset}`, JSON.stringify(response.body, null, 2));
    }
  }
}

/**
 * Print section header
 */
function printSection(title) {
  console.log(`\n${COLORS.blue}${'='.repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.blue}${title}${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(60)}${COLORS.reset}\n`);
}

/**
 * Print test summary
 */
function printSummary(passed, failed, total) {
  console.log(`\n${COLORS.blue}${'='.repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.blue}TEST SUMMARY${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(60)}${COLORS.reset}`);
  console.log(`Total:  ${total}`);
  console.log(`${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(`${COLORS.red}Failed: ${failed}${COLORS.reset}`);
  console.log(`${COLORS.blue}${'='.repeat(60)}${COLORS.reset}\n`);
}

/**
 * Process API response and return success data or throw error
 */
function processApiResponse(response) {
  const isSuccess = response.statusCode >= 200 && response.statusCode < 300;
  
  if (isSuccess && response.body) {
    return response.body;
  }
  
  // Handle error responses
  const errorMessage = response.body?.message || `HTTP ${response.statusCode}`;
  throw new Error(errorMessage);
}

/**
 * Store authentication token
 */
function storeToken(userType, token) {
  TOKENS[userType] = token;
  if (CONFIG.verbose) {
    console.log(`  ${COLORS.gray}Token stored for ${userType}${COLORS.reset}`);
  }
}

/**
 * Get authentication token
 */
function getToken(userType) {
  return TOKENS[userType];
}

/**
 * Create authorization header
 */
function authHeader(userType) {
  const token = getToken(userType);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random email
 */
function randomEmail(prefix = 'test') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@test.com`;
}

/**
 * Generate random username
 */
function randomUsername(prefix = 'user') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  CONFIG,
  TOKENS,
  COLORS,
  makeRequest,
  processApiResponse,
  printTestResult,
  printSection,
  printSummary,
  storeToken,
  getToken,
  authHeader,
  sleep,
  randomEmail,
  randomUsername,
};
