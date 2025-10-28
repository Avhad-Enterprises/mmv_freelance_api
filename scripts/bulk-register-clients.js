#!/usr/bin/env node

/**
 * Bulk Client Registration Script
 * 
 * This script reads clients from a CSV file and registers them using the API
 * Usage: node scripts/bulk-register-clients.js <csv-file-path>
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const FormData = require('form-data');
const { makeRequest } = require('../tests/test-utils');

// Test configuration
const TEST_CONFIG = {
    endpoint: '/auth/register/client',
    timeout: 15000
};

/**
 * Create test files for registration
 */
function createTestFiles() {
    const testDir = path.join(__dirname, '..', 'tests', 'auth', 'test-files');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test profile photo (PNG)
    const profilePhotoPath = path.join(testDir, 'test-profile.png');
    if (!fs.existsSync(profilePhotoPath)) {
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01,
            0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00,
            0x90, 0x77, 0x53, 0xDE,
            0x00, 0x00, 0x00, 0x0C,
            0x49, 0x44, 0x41, 0x54,
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
            0x00, 0x00, 0x00, 0x00,
            0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(profilePhotoPath, pngData);
    }

    // Create test business document (PDF)
    const businessDocPath = path.join(testDir, 'test-document.pdf');
    if (!fs.existsSync(businessDocPath)) {
        const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000150 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
200
%%EOF`;
        fs.writeFileSync(businessDocPath, pdfContent);
    }

    return {
        profilePhotoPath,
        businessDocPath
    };
}

/**
 * Register a single client with retries
 */
async function registerClient(data, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt} for ${data.email}...`);
            const formData = new FormData();
            const { profilePhotoPath, businessDocPath } = createTestFiles();

        // Add fields from CSV with proper formatting
        const fields = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            company_name: data.company_name,
            industry: data.industry,
            company_size: data.company_size,
            country: data.country,
            phone_number: data.phone_number,
            terms_accepted: data.terms_accepted,
            privacy_policy_accepted: data.privacy_policy_accepted,
            company_website: data.company_website,
            company_description: data.company_description,
            social_links: JSON.stringify(data.social_links.split(',')),
            city: data.city,
            state: data.state,
            zip_code: data.zip_code,
            work_arrangement: data.work_arrangement,
            project_frequency: data.project_frequency,
            hiring_preferences: data.hiring_preferences,
            project_title: data.project_title,
            project_description: data.project_description,
            project_category: data.project_category,
            project_budget: data.project_budget,
            project_timeline: data.project_timeline
        };

        // Add fields to form data
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, typeof value === 'boolean' ? value.toString() : value);
        });

        // Add file uploads with correct field names and content types
        formData.append('profile_picture', fs.createReadStream(profilePhotoPath), {
            filename: 'profile.png',
            contentType: 'image/png'
        });
        formData.append('business_document', fs.createReadStream(businessDocPath), {
            filename: 'document.pdf',
            contentType: 'application/pdf'
        });

        // Make API request using test utils
        const response = await makeRequest(
            'POST',
            TEST_CONFIG.endpoint,
            null,
            formData,
            TEST_CONFIG.timeout
        );

        return {
            success: true,
            email: data.email,
            response: response
        };
    } catch (error) {
        return {
            success: false,
            email: data.email,
            error: error.message || 'Unknown error occurred'
        };
    }
}

/**
 * Process the CSV file and register clients
 */
async function processCsvFile(filePath) {
    const results = {
        successful: [],
        failed: []
    };

    const parser = fs
        .createReadStream(filePath)
        .pipe(parse({
            columns: true,
            skip_empty_lines: true
        }));

    for await (const record of parser) {
        console.log(`Processing registration for ${record.email}...`);
        const result = await registerClient(record);
        
        if (result.success) {
            results.successful.push(result.email);
            console.log(`✓ Successfully registered ${result.email}`);
        } else {
            results.failed.push({
                email: result.email,
                error: result.error
            });
            console.log(`✗ Failed to register ${result.email}: ${result.error}`);
        }

        // Add a small delay between requests to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

/**
 * Main execution
 */
async function main() {
    const csvFilePath = process.argv[2];
    
    if (!csvFilePath) {
        console.error('Please provide the path to the CSV file');
        console.error('Usage: node scripts/bulk-register-clients.js <csv-file-path>');
        process.exit(1);
    }

    if (!fs.existsSync(csvFilePath)) {
        console.error(`File not found: ${csvFilePath}`);
        process.exit(1);
    }

    console.log('Starting bulk registration process...');
    
    try {
        const results = await processCsvFile(csvFilePath);

        // Print summary
        console.log('\nRegistration Summary:');
        console.log('--------------------');
        console.log(`Total Successful: ${results.successful.length}`);
        console.log(`Total Failed: ${results.failed.length}`);

        if (results.failed.length > 0) {
            console.log('\nFailed Registrations:');
            results.failed.forEach(({ email, error }) => {
                console.log(`- ${email}: ${error}`);
            });
        }

        process.exit(results.failed.length === 0 ? 0 : 1);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
main().catch(error => {
    console.error('An error occurred:', error);
    process.exit(1);
});    console.error('An error occurred:', error);
    process.exit(1);
}