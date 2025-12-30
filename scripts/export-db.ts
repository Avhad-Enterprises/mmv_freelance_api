
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function exportDatabase() {
    try {
        console.log('📦 Preparing Database Export...');

        // Verify .env existence
        const envPath = path.join(__dirname, '../.env');
        if (!fs.existsSync(envPath)) {
            throw new Error(`❌ .env file found at ${envPath}`);
        }

        // Manually read .env to avoid loading issues
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envConfig: Record<string, string> = {};

        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
                if (key && !key.startsWith('#')) {
                    envConfig[key] = value;
                }
            }
        });

        const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = envConfig;

        if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
            console.error('Loaded Config:', { DB_HOST, DB_USER, DB_DATABASE, DB_PORT }); // Don't log password
            throw new Error('❌ Missing database credentials in .env file (manual parse)');
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${DB_DATABASE}_${timestamp}.sql`;
        const outputPath = path.join(process.cwd(), filename);

        console.log(`connection details: User: ${DB_USER}, Host: ${DB_HOST}, DB: ${DB_DATABASE}`);

        const command = `pg_dump -h ${DB_HOST} -p ${DB_PORT || 5432} -U ${DB_USER} -d ${DB_DATABASE} --no-owner --no-acl --verbose --file="${outputPath}"`;

        console.log('🔄 Running pg_dump...');

        await execAsync(command, {
            env: { ...process.env, PGPASSWORD: DB_PASSWORD }
        });

        console.log('✅ Export successful!');
        console.log(`📂 Saved to: ${outputPath}`);

        const stats = fs.statSync(outputPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 Size: ${sizeMB} MB`);

    } catch (error: any) {
        console.error('💥 Export failed:', error.message);
    }
}

exportDatabase();
