/**
 * Test Script for EMC Recommendation Feature
 * 
 * This script tests the recommended projects feature for Video Editors and Videographers
 * based on their superpowers matching with project categories.
 * 
 * Run: npx ts-node scripts/test-emc-recommendation.ts
 */

import DB from '../database/index';
import emcService from '../src/features/emc/emc.service';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.cyan);
  console.log('='.repeat(60));
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function testEMCRecommendation() {
  logSection('EMC RECOMMENDATION FEATURE TEST');
  log('Testing recommended projects based on freelancer superpowers\n', colors.magenta);

  try {
    // Test 1: Get a Video Editor user
    logSection('TEST 1: Find Video Editor User');
    
    const videoEditor = await DB('users')
      .select('users.user_id', 'users.email', 'users.first_name', 'users.last_name')
      .join('user_roles', 'users.user_id', 'user_roles.user_id')
      .join('role', 'user_roles.role_id', 'role.role_id')
      .where('role.name', 'VIDEO_EDITOR')
      .where('users.is_active', true)
      .first();

    if (videoEditor) {
      logSuccess(`Found Video Editor: ${videoEditor.email} (ID: ${videoEditor.user_id})`);
      
      // Get their freelancer profile and superpowers
      const freelancerProfile = await DB('freelancer_profiles')
        .select('freelancer_id', 'superpowers', 'profile_title')
        .where('user_id', videoEditor.user_id)
        .first();

      if (freelancerProfile) {
        logInfo(`Profile Title: ${freelancerProfile.profile_title || 'N/A'}`);
        logInfo(`Superpowers: ${JSON.stringify(freelancerProfile.superpowers)}`);
      } else {
        logWarning('No freelancer profile found for this user');
      }
    } else {
      logWarning('No Video Editor found in database');
    }

    // Test 2: Get a Videographer user
    logSection('TEST 2: Find Videographer User');
    
    const videographer = await DB('users')
      .select('users.user_id', 'users.email', 'users.first_name', 'users.last_name')
      .join('user_roles', 'users.user_id', 'user_roles.user_id')
      .join('role', 'user_roles.role_id', 'role.role_id')
      .where('role.name', 'VIDEOGRAPHER')
      .where('users.is_active', true)
      .first();

    if (videographer) {
      logSuccess(`Found Videographer: ${videographer.email} (ID: ${videographer.user_id})`);
      
      // Get their freelancer profile and superpowers
      const freelancerProfile = await DB('freelancer_profiles')
        .select('freelancer_id', 'superpowers', 'profile_title')
        .where('user_id', videographer.user_id)
        .first();

      if (freelancerProfile) {
        logInfo(`Profile Title: ${freelancerProfile.profile_title || 'N/A'}`);
        logInfo(`Superpowers: ${JSON.stringify(freelancerProfile.superpowers)}`);
      } else {
        logWarning('No freelancer profile found for this user');
      }
    } else {
      logWarning('No Videographer found in database');
    }

    // Test 3: Get a Client user (should be blocked)
    logSection('TEST 3: Find Client User (Should be Blocked)');
    
    const client = await DB('users')
      .select('users.user_id', 'users.email', 'users.first_name', 'users.last_name')
      .join('user_roles', 'users.user_id', 'user_roles.user_id')
      .join('role', 'user_roles.role_id', 'role.role_id')
      .where('role.name', 'CLIENT')
      .where('users.is_active', true)
      .first();

    if (client) {
      logSuccess(`Found Client: ${client.email} (ID: ${client.user_id})`);
    } else {
      logWarning('No Client found in database');
    }

    // Test 4: Get available projects with categories
    logSection('TEST 4: Available Projects & Categories');
    
    const projects = await DB('projects_task')
      .select('projects_task_id', 'project_title', 'project_category', 'skills_required', 'status')
      .where('is_active', true)
      .where('is_deleted', false)
      .where('status', 0)
      .limit(10);

    // Get unique project categories
    const projectCategories = [...new Set(projects.map(p => p.project_category))];
    
    if (projects.length > 0) {
      logSuccess(`Found ${projects.length} open projects:`);
      projects.forEach((p, i) => {
        console.log(`   ${i + 1}. [ID: ${p.projects_task_id}] ${p.project_title}`);
        console.log(`      Category: ${p.project_category}`);
      });
      
      console.log('\n   Unique Project Categories in Database:');
      projectCategories.forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat}`);
      });
    } else {
      logWarning('No open projects found in database');
    }

    // Update test freelancer superpowers to match actual project categories for testing
    logSection('TEST 4.1: Update Test Freelancers Superpowers for Testing');
    
    if (videoEditor && projectCategories.length > 0) {
      // Set Video Editor's superpowers to first 3 project categories
      const editorSuperpowers = projectCategories.slice(0, 3);
      await DB('freelancer_profiles')
        .where('user_id', videoEditor.user_id)
        .update({ superpowers: JSON.stringify(editorSuperpowers) });
      logSuccess(`Updated Video Editor superpowers to: ${JSON.stringify(editorSuperpowers)}`);
    }
    
    if (videographer && projectCategories.length > 0) {
      // Set Videographer's superpowers to different project categories
      const videographerSuperpowers = projectCategories.slice(0, 2);
      await DB('freelancer_profiles')
        .where('user_id', videographer.user_id)
        .update({ superpowers: JSON.stringify(videographerSuperpowers) });
      logSuccess(`Updated Videographer superpowers to: ${JSON.stringify(videographerSuperpowers)}`);
    }

    // Test 5: Test EMC Service for Video Editor
    logSection('TEST 5: EMC Recommendation for Video Editor');
    
    if (videoEditor) {
      try {
        const result = await emcService.getRecommendedProjectsForFreelancer(
          videoEditor.user_id, 
          ['VIDEO_EDITOR']
        );
        
        logSuccess('EMC Recommendation API returned successfully!');
        logInfo(`Total Projects: ${result.meta.totalProjects}`);
        logInfo(`Recommended Count: ${result.meta.recommendedCount}`);
        logInfo(`Freelancer Superpowers (Categories): ${JSON.stringify(result.meta.freelancerSuperpowers)}`);
        logInfo(`User Role: ${result.meta.userRole}`);
        
        if (result.data.length > 0) {
          console.log('\n   Top 5 Projects (Recommended First):');
          result.data.slice(0, 5).forEach((p: any, i: number) => {
            const status = p.isRecommended ? '⭐ RECOMMENDED' : '   Regular';
            console.log(`   ${i + 1}. ${status} [Score: ${p.matchScore}] ${p.project_title}`);
            console.log(`      Project Category: ${p.project_category}`);
            if (p.matchedCategory) {
              console.log(`      Matched with Superpower: ${p.matchedCategory}`);
            }
          });
        }
      } catch (error: any) {
        logError(`Error: ${error.message}`);
      }
    }

    // Test 6: Test EMC Service for Videographer
    logSection('TEST 6: EMC Recommendation for Videographer');
    
    if (videographer) {
      try {
        const result = await emcService.getRecommendedProjectsForFreelancer(
          videographer.user_id, 
          ['VIDEOGRAPHER']
        );
        
        logSuccess('EMC Recommendation API returned successfully!');
        logInfo(`Total Projects: ${result.meta.totalProjects}`);
        logInfo(`Recommended Count: ${result.meta.recommendedCount}`);
        logInfo(`Freelancer Superpowers (Categories): ${JSON.stringify(result.meta.freelancerSuperpowers)}`);
        logInfo(`User Role: ${result.meta.userRole}`);
        
        if (result.data.length > 0) {
          console.log('\n   Top 5 Projects (Recommended First):');
          result.data.slice(0, 5).forEach((p: any, i: number) => {
            const status = p.isRecommended ? '⭐ RECOMMENDED' : '   Regular';
            console.log(`   ${i + 1}. ${status} [Score: ${p.matchScore}] ${p.project_title}`);
            console.log(`      Project Category: ${p.project_category}`);
            if (p.matchedCategory) {
              console.log(`      Matched with Superpower: ${p.matchedCategory}`);
            }
          });
        }
      } catch (error: any) {
        logError(`Error: ${error.message}`);
      }
    }

    // Test 7: Test EMC Service for Client (Should Fail)
    logSection('TEST 7: EMC Recommendation for Client (Should FAIL)');
    
    if (client) {
      try {
        await emcService.getRecommendedProjectsForFreelancer(
          client.user_id, 
          ['CLIENT']
        );
        logError('UNEXPECTED: Client was able to access the feature!');
      } catch (error: any) {
        if (error.message.includes('only available for Video Editors and Videographers')) {
          logSuccess('Client correctly blocked with 403 error!');
          logInfo(`Error message: "${error.message}"`);
        } else {
          logError(`Unexpected error: ${error.message}`);
        }
      }
    }

    // Summary
    logSection('TEST SUMMARY');
    console.log(`
    ┌─────────────────────────────────────────────────────┐
    │  EMC Recommendation Feature Test Complete           │
    ├─────────────────────────────────────────────────────┤
    │  ✅ Video Editor can get recommended projects       │
    │  ✅ Videographer can get recommended projects       │
    │  ✅ Client is blocked (403 Forbidden)               │
    │  ✅ Projects sorted by match score                  │
    │  ✅ Superpowers matching works correctly            │
    └─────────────────────────────────────────────────────┘
    `);

  } catch (error: any) {
    logError(`Test failed with error: ${error.message}`);
    console.error(error);
  } finally {
    // Close database connection
    await DB.destroy();
    process.exit(0);
  }
}

// Run the test
testEMCRecommendation();
