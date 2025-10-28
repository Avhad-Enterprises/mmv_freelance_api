#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const FormData = require('form-data');
const { CONFIG, makeRequest } = require('../tests/test-utils');

// Configuration
const API_CONFIG = {
  baseUrl: CONFIG.baseUrl,
  apiVersion: CONFIG.apiVersion,
  endpoint: '/auth/register/videoeditor',
  timeout: 15000
};

// Default profile photo and ID document paths
const DEFAULT_PROFILE_PHOTO = path.join(__dirname, '../tests/auth/test-files/test-profile.png');
const DEFAULT_ID_DOCUMENT = path.join(__dirname, '../tests/auth/test-files/test-id.pdf');

// Create test files if they don't exist (reusing function from test file)
function createTestFiles() {
  const testDir = path.join(__dirname, '../tests/auth/test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create test image file if it doesn't exist
  if (!fs.existsSync(DEFAULT_PROFILE_PHOTO)) {
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(DEFAULT_PROFILE_PHOTO, pngData);
  }

  // Create test PDF file if it doesn't exist
  if (!fs.existsSync(DEFAULT_ID_DOCUMENT)) {
    const pdfContent = Buffer.from([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A,
      0x25, 0x25, 0x45, 0x4F, 0x46
    ]);
    fs.writeFileSync(DEFAULT_ID_DOCUMENT, pdfContent);
  }

  return { DEFAULT_PROFILE_PHOTO, DEFAULT_ID_DOCUMENT };
}

async function registerVideoEditor(data) {
  const formData = new FormData();

  // Add all fields from CSV data
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value) {
      // Parse JSON strings for array fields
      if (['skill_tags', 'superpowers', 'portfolio_links', 'languages', 'base_skills'].includes(key)) {
        formData.append(key, value.startsWith('[') ? value : JSON.stringify([value]));
      } else if (['terms_accepted', 'privacy_policy_accepted'].includes(key)) {
        formData.append(key, value.toString().toLowerCase());
      } else {
        formData.append(key, value);
      }
    }
  });

  // Add default files
  formData.append('profile_photo', fs.createReadStream(DEFAULT_PROFILE_PHOTO), {
    filename: 'profile.png',
    contentType: 'image/png'
  });
  
  formData.append('id_document', fs.createReadStream(DEFAULT_ID_DOCUMENT), {
    filename: 'id_doc.pdf',
    contentType: 'application/pdf'
  });

  try {
    const response = await makeRequest(
      'POST',
      API_CONFIG.apiVersion + API_CONFIG.endpoint,
      null,
      formData
    );

    return {
      success: response.statusCode === 201,
      email: data.email,
      status: response.statusCode,
      message: response.body.message || JSON.stringify(response.body)
    };
  } catch (error) {
    return {
      success: false,
      email: data.email,
      status: error.response?.statusCode || 500,
      message: error.message
    };
  }
}

async function main() {
  const csvFile = process.argv[2];
  if (!csvFile) {
    console.error('Please provide the path to the CSV file');
    process.exit(1);
  }

  // Create test files first
  createTestFiles();

  const results = {
    successful: [],
    failed: [],
    retryQueue: []
  };

  // Read all entries from CSV file first
  const entries = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (data) => entries.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${entries.length} entries to process.\n`);

  // Process all entries in parallel with a concurrency limit
  const concurrencyLimit = 5;
  const maxRetries = 3;

  // First pass: Process all entries
  for (let i = 0; i < entries.length; i += concurrencyLimit) {
    const batch = entries.slice(i, i + concurrencyLimit);
    console.log(`\nProcessing batch ${Math.floor(i/concurrencyLimit) + 1} of ${Math.ceil(entries.length/concurrencyLimit)}...`);
    
    const batchResults = await Promise.all(batch.map(data => registerVideoEditor(data)));
    
    batchResults.forEach((result, index) => {
      if (result.success) {
        results.successful.push(result);
        console.log(`✅ Successfully registered ${result.email}`);
      } else {
        // Add to retry queue if it's a server error (5xx)
        if (result.status >= 500) {
          results.retryQueue.push({
            data: batch[index],
            retries: 0
          });
          console.log(`⚠️  Will retry ${result.email} later: ${result.message}`);
        } else {
          results.failed.push(result);
          console.log(`❌ Failed to register ${result.email}: ${result.message}`);
        }
      }
    });

    // Small delay between batches to avoid overwhelming the server
    if (i + concurrencyLimit < entries.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Retry failed entries that had server errors
  if (results.retryQueue.length > 0) {
    console.log(`\nRetrying ${results.retryQueue.length} failed registrations...`);

    while (results.retryQueue.length > 0) {
      const entry = results.retryQueue.shift();
      
      if (entry.retries < maxRetries) {
        console.log(`\nRetry attempt ${entry.retries + 1} for ${entry.data.email}...`);
        
        // Wait longer between retries
        await new Promise(resolve => setTimeout(resolve, 2000 * (entry.retries + 1)));
        
        const result = await registerVideoEditor(entry.data);
        
        if (result.success) {
          results.successful.push(result);
          console.log(`✅ Successfully registered ${result.email} on retry`);
        } else {
          entry.retries++;
          if (entry.retries < maxRetries && result.status >= 500) {
            results.retryQueue.push(entry);
            console.log(`⚠️  Will retry ${result.email} again: ${result.message}`);
          } else {
            results.failed.push(result);
            console.log(`❌ Failed to register ${result.email} after ${entry.retries} retries: ${result.message}`);
          }
        }
      }
    }
  }

  console.log('\nFinal Registration Summary:');
  console.log(`Total Entries Processed: ${entries.length}`);
  console.log(`Total Successful: ${results.successful.length}`);
  console.log(`Total Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed Registrations:');
    results.failed.forEach(failure => {
      console.log(`- ${failure.email}: ${failure.message}`);
    });
  }
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});