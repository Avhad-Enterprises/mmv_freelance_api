#!/usr/bin/env node

/**
 * Bulk Videographer Registration Script
 * 
 * This script reads videographers from a CSV file and registers them using the API
 * Usage: node scripts/bulk-register-videographers.js <csv-file-path>
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const FormData = require('form-data');
const { makeRequest } = require('../tests/test-utils');

// Test configuration
const TEST_CONFIG = {
    endpoint: '/auth/register/videographer',
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
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
            0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);
        fs.writeFileSync(profilePhotoPath, pngData);
    }

    // Create test ID document (PDF)
    const idDocPath = path.join(testDir, 'test-id.pdf');
    if (!fs.existsSync(idDocPath)) {
        const pdfData = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n72 500 TD\n(Test ID Document) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \n0000000301 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n406\n%%EOF\n');
        fs.writeFileSync(idDocPath, pdfData);
    }

    return {
        profilePhotoPath,
        idDocPath
    };
}

/**
 * Register a single videographer
 */
async function registerVideographer(data) {
    try {
        const formData = new FormData();
        const { profilePhotoPath, idDocPath } = createTestFiles();

        // Add fields from CSV with proper formatting
        const fields = {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            skill_tags: JSON.stringify(data.skill_tags.split(',')),
            superpowers: JSON.stringify(data.superpowers.split(',')),
            country: data.country,
            portfolio_links: JSON.stringify(data.portfolio_links.split(',')),
            phone_number: data.phone_number,
            id_type: data.id_type,
            short_description: data.short_description,
            languages: JSON.stringify(data.languages.split(',')),
            terms_accepted: data.terms_accepted,
            privacy_policy_accepted: data.privacy_policy_accepted,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            rate_amount: data.rate_amount,
            currency: data.rate_currency,
            availability: data.availability,
            experience_level: data.experience_level,
            role: data.role,
            base_skills: JSON.stringify(data.base_skills.split(','))
        };

        // Add fields to form data
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, typeof value === 'boolean' ? value.toString() : value);
        });

        // Add file uploads with correct field names and content types
        formData.append('profile_photo', fs.createReadStream(profilePhotoPath), {
            filename: 'profile.png',
            contentType: 'image/png'
        });
        formData.append('id_document', fs.createReadStream(idDocPath), {
            filename: 'id_doc.pdf',
            contentType: 'application/pdf'
        });

        // Make API request using test utils
        const response = await makeRequest(
            'POST',
            `/api/v1${TEST_CONFIG.endpoint}`,
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
 * Process the CSV file and register videographers
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
        const result = await registerVideographer(record);
        
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
        console.error('Usage: node scripts/bulk-register-videographers.js <csv-file-path>');
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
});