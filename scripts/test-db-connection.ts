#!/usr/bin/env ts-node
/**
 * Database Connection Test Script
 * Tests connection to PostgreSQL database and validates schema
 * 
 * Usage: npm run test:db
 * Or: ts-node scripts/test-db-connection.ts
 */

import DB from '../database/index.schema';
import dotenv from 'dotenv';

dotenv.config();

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * Add test result
 */
function addResult(test: string, status: 'PASS' | 'FAIL', message: string, details?: any) {
  results.push({ test, status, message, details });
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

/**
 * Test 1: Basic Connection
 */
async function testConnection() {
  try {
    await DB.raw('SELECT 1 as test');
    addResult('Connection Test', 'PASS', 'Database connection successful');
    return true;
  } catch (error: any) {
    addResult('Connection Test', 'FAIL', `Connection failed: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Database Info
 */
async function testDatabaseInfo() {
  try {
    const result = await DB.raw('SELECT version() as version, current_database() as database');
    const info = result.rows[0];
    addResult('Database Info', 'PASS', 'Retrieved database information', {
      database: info.database,
      version: info.version.split('\n')[0]
    });
    return true;
  } catch (error: any) {
    addResult('Database Info', 'FAIL', `Failed to get database info: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Check Core Tables Exist
 */
async function testCoreTables() {
  const tables = [
    'users',
    'role',
    'permission',
    'user_roles',
    'role_permission',
    'client_profiles',
    'freelancer_profiles',
    'videographer_profiles',
    'videoeditor_profiles',
    'admin_profiles',
    'category',
    'skills',
    'projects_task',
    'support_tickets'
  ];

  try {
    const existingTables = await DB.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tableNames = existingTables.rows.map((row: any) => row.table_name);
    const missingTables = tables.filter(table => !tableNames.includes(table));
    const foundTables = tables.filter(table => tableNames.includes(table));

    if (missingTables.length === 0) {
      addResult('Core Tables Check', 'PASS', `All ${tables.length} core tables exist`, {
        found: foundTables.length,
        tables: foundTables
      });
      return true;
    } else {
      addResult('Core Tables Check', 'FAIL', `Missing ${missingTables.length} tables`, {
        missing: missingTables,
        found: foundTables
      });
      return false;
    }
  } catch (error: any) {
    addResult('Core Tables Check', 'FAIL', `Error checking tables: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Check New Profile Tables Structure
 */
async function testProfileTablesStructure() {
  const profileTables = [
    'client_profiles',
    'freelancer_profiles',
    'videographer_profiles',
    'videoeditor_profiles',
    'admin_profiles'
  ];

  try {
    let allValid = true;
    const results: any = {};

    for (const table of profileTables) {
      const columns = await DB.raw(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ?
        ORDER BY ordinal_position
      `, [table]);

      // Different tables have different foreign key patterns
      let hasCorrectForeignKey = false;
      if (['client_profiles', 'freelancer_profiles', 'admin_profiles'].includes(table)) {
        hasCorrectForeignKey = columns.rows.some((col: any) => col.column_name === 'user_id');
      } else if (['videographer_profiles', 'videoeditor_profiles'].includes(table)) {
        hasCorrectForeignKey = columns.rows.some((col: any) => col.column_name === 'profile_id');
      }

      const hasPrimaryKey = columns.rows.some((col: any) => 
        col.column_name.includes('_id') && col.column_name !== 'user_id' && col.column_name !== 'profile_id'
      );

      results[table] = {
        exists: columns.rows.length > 0,
        columns: columns.rows.length,
        hasCorrectForeignKey,
        hasPrimaryKey
      };

      if (!hasCorrectForeignKey || !hasPrimaryKey) {
        allValid = false;
      }
    }

    if (allValid) {
      addResult('Profile Tables Structure', 'PASS', 'All profile tables have correct structure', results);
      return true;
    } else {
      addResult('Profile Tables Structure', 'FAIL', 'Some profile tables have structural issues', results);
      return false;
    }
  } catch (error: any) {
    addResult('Profile Tables Structure', 'FAIL', `Error checking structure: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Check RBAC System
 */
async function testRBACSystem() {
  try {
    // Check roles exist
    const roles = await DB('role').select('name', 'label');
    const roleNames = roles.map(r => r.name);
    
    const expectedRoles = ['CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN'];
    const missingRoles = expectedRoles.filter(r => !roleNames.includes(r));

    // Check permissions exist
    const permissions = await DB('permission').count('* as count');
    const permissionCount = Number(permissions[0].count);

    // Check user_roles table
    const userRolesCount = await DB('user_roles').count('* as count');
    const assignedRoles = Number(userRolesCount[0].count);

    const rbacStatus = {
      roles: roles.length,
      rolesList: roleNames,
      missingRoles,
      permissions: permissionCount,
      assignedRoles
    };

    if (missingRoles.length === 0 && permissionCount > 0) {
      addResult('RBAC System', 'PASS', 'RBAC system configured correctly', rbacStatus);
      return true;
    } else {
      addResult('RBAC System', 'FAIL', 'RBAC system incomplete', rbacStatus);
      return false;
    }
  } catch (error: any) {
    addResult('RBAC System', 'FAIL', `Error checking RBAC: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Check Data Consistency (Dual-Write Validation)
 */
async function testDataConsistency() {
  try {
    // Count users
    const usersCount = await DB('users').count('* as count');
    const totalUsers = Number(usersCount[0].count);

    // Count profiles
    const clientProfilesCount = await DB('client_profiles').count('* as count');
    const freelancerProfilesCount = await DB('freelancer_profiles').count('* as count');
    const adminProfilesCount = await DB('admin_profiles').count('* as count');

    const clientProfiles = Number(clientProfilesCount[0].count);
    const freelancerProfiles = Number(freelancerProfilesCount[0].count);
    const adminProfiles = Number(adminProfilesCount[0].count);
    const totalProfiles = clientProfiles + freelancerProfiles + adminProfiles;

    // Check user_roles assignments
    const userRolesCount = await DB('user_roles').count('* as count');
    const assignedRoles = Number(userRolesCount[0].count);

    const consistency = {
      users: totalUsers,
      profiles: {
        clients: clientProfiles,
        freelancers: freelancerProfiles,
        admins: adminProfiles,
        total: totalProfiles
      },
      roleAssignments: assignedRoles,
      profileCoverage: totalUsers > 0 ? ((totalProfiles / totalUsers) * 100).toFixed(1) + '%' : 'N/A'
    };

    if (totalUsers >= totalProfiles && assignedRoles >= totalUsers) {
      addResult('Data Consistency', 'PASS', 'Data structure is consistent', consistency);
      return true;
    } else {
      addResult('Data Consistency', 'FAIL', 'Data inconsistency detected', consistency);
      return false;
    }
  } catch (error: any) {
    addResult('Data Consistency', 'FAIL', `Error checking consistency: ${error.message}`);
    return false;
  }
}

/**
 * Test 7: Check Foreign Key Constraints
 */
async function testForeignKeys() {
  try {
    const foreignKeys = await DB.raw(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('client_profiles', 'freelancer_profiles', 'videographer_profiles', 'videoeditor_profiles', 'admin_profiles', 'user_roles')
      ORDER BY tc.table_name
    `);

    const fkCount = foreignKeys.rows.length;
    const expectedMinimum = 5; // At least one FK per profile table

    if (fkCount >= expectedMinimum) {
      addResult('Foreign Keys', 'PASS', `${fkCount} foreign key constraints found`, {
        constraints: foreignKeys.rows.map((fk: any) => 
          `${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`
        )
      });
      return true;
    } else {
      addResult('Foreign Keys', 'FAIL', `Only ${fkCount} foreign keys found (expected ${expectedMinimum}+)`);
      return false;
    }
  } catch (error: any) {
    addResult('Foreign Keys', 'FAIL', `Error checking foreign keys: ${error.message}`);
    return false;
  }
}

/**
 * Test 8: Sample Query Performance
 */
async function testQueryPerformance() {
  try {
    const start = Date.now();
    
    // Test a complex join query (similar to what the app does)
    await DB('users')
      .leftJoin('client_profiles', 'users.user_id', 'client_profiles.user_id')
      .leftJoin('freelancer_profiles', 'users.user_id', 'freelancer_profiles.user_id')
      .leftJoin('user_roles', 'users.user_id', 'user_roles.user_id')
      .leftJoin('role', 'user_roles.role_id', 'role.role_id')
      .select('users.*', 'role.name as role_name')
      .limit(10);

    const duration = Date.now() - start;

    if (duration < 1000) {
      addResult('Query Performance', 'PASS', `Sample query executed in ${duration}ms`, {
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
      return true;
    } else {
      addResult('Query Performance', 'FAIL', `Query slow: ${duration}ms (threshold: 1000ms)`, {
        duration: `${duration}ms`
      });
      return false;
    }
  } catch (error: any) {
    addResult('Query Performance', 'FAIL', `Query failed: ${error.message}`);
    return false;
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('\n🧪 Database Connection & Schema Test Suite\n');
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log('='.repeat(60));
  console.log('\n');

  const tests = [
    { name: 'Connection Test', fn: testConnection },
    { name: 'Database Info', fn: testDatabaseInfo },
    { name: 'Core Tables Check', fn: testCoreTables },
    { name: 'Profile Tables Structure', fn: testProfileTablesStructure },
    { name: 'RBAC System', fn: testRBACSystem },
    { name: 'Data Consistency', fn: testDataConsistency },
    { name: 'Foreign Keys', fn: testForeignKeys },
    { name: 'Query Performance', fn: testQueryPerformance }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('\n' + '='.repeat(60));

  // Close database connection
  await DB.destroy();

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite crashed:', error.message);
  console.error(error.stack);
  DB.destroy().then(() => process.exit(1));
});
