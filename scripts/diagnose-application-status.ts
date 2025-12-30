/**
 * Database Diagnostic Script
 * Purpose: Check application status in database for project "2" 
 * between testclient@gmail.com and testeditor@gmail.com
 */

import DB, { T } from '../database/index';

async function diagnoseApplicationStatus() {
    try {
        console.log('='.repeat(80));
        console.log('DATABASE DIAGNOSTIC: Application Status Check');
        console.log('='.repeat(80));
        console.log('');

        // Step 1: Find the client user
        console.log('Step 1: Finding client user (testclient@gmail.com)...');
        const client = await DB(T.USERS_TABLE)
            .where({ email: 'testclient@gmail.com' })
            .select('user_id', 'email', 'first_name', 'last_name')
            .first();

        if (!client) {
            console.log('❌ Client not found!');
            return;
        }
        console.log('✅ Client found:', client);
        console.log('');

        // Step 2: Find the freelancer user
        console.log('Step 2: Finding freelancer user (testeditor@gmail.com)...');
        const freelancer = await DB(T.USERS_TABLE)
            .where({ email: 'testeditor@gmail.com' })
            .select('user_id', 'email', 'first_name', 'last_name')
            .first();

        if (!freelancer) {
            console.log('❌ Freelancer not found!');
            return;
        }
        console.log('✅ Freelancer found:', freelancer);
        console.log('');

        // Step 3: Find the client profile
        console.log('Step 3: Finding client profile...');
        const clientProfile = await DB(T.CLIENT_PROFILES)
            .where({ user_id: client.user_id })
            .select('client_id', 'user_id')
            .first();

        if (!clientProfile) {
            console.log('❌ Client profile not found!');
            return;
        }
        console.log('✅ Client profile found:', clientProfile);
        console.log('');

        // Step 4: Find the project with title "2"
        console.log('Step 4: Finding project with title "2"...');
        const project = await DB(T.PROJECTS_TASK)
            .where({
                project_title: '2',
                client_id: clientProfile.client_id
            })
            .select('projects_task_id', 'project_title', 'client_id', 'status', 'created_at')
            .first();

        if (!project) {
            console.log('❌ Project not found!');
            console.log('Searching for any project with title "2"...');
            const anyProject = await DB(T.PROJECTS_TASK)
                .where({ project_title: '2' })
                .select('projects_task_id', 'project_title', 'client_id', 'status')
                .first();
            if (anyProject) {
                console.log('Found project but with different client:', anyProject);
            }
            return;
        }
        console.log('✅ Project found:', project);
        console.log('');

        // Step 5: Find the application
        console.log('Step 5: Finding application...');
        const application = await DB(T.APPLIED_PROJECTS)
            .where({
                projects_task_id: project.projects_task_id,
                user_id: freelancer.user_id
            })
            .select('*')
            .first();

        if (!application) {
            console.log('❌ Application not found!');
            return;
        }
        console.log('✅ Application found:');
        console.log('');
        console.log('APPLICATION DETAILS:');
        console.log('-'.repeat(80));
        console.log('Applied Projects ID:', application.applied_projects_id);
        console.log('Projects Task ID:', application.projects_task_id);
        console.log('User ID (Freelancer):', application.user_id);
        console.log('STATUS:', application.status, getStatusText(application.status));
        console.log('Rejection Reason:', application.rejection_reason || 'NULL');
        console.log('Created At:', application.created_at);
        console.log('Updated At:', application.updated_at);
        console.log('Is Active:', application.is_active);
        console.log('Is Deleted:', application.is_deleted);
        console.log('-'.repeat(80));
        console.log('');

        // Step 6: Check what the API returns for this freelancer
        console.log('Step 6: Checking what API returns for freelancer...');
        const apiResponse = await DB(T.APPLIED_PROJECTS)
            .join('projects_task', 'applied_projects.projects_task_id', '=', 'projects_task.projects_task_id')
            .leftJoin(T.CLIENT_PROFILES, 'projects_task.client_id', `${T.CLIENT_PROFILES}.client_id`)
            .leftJoin(`${T.USERS_TABLE} as client`, `${T.CLIENT_PROFILES}.user_id`, 'client.user_id')
            .where({
                'applied_projects.user_id': freelancer.user_id,
                'applied_projects.is_deleted': false
            })
            .orderBy('applied_projects.created_at', 'desc')
            .select(
                'applied_projects.*',
                'projects_task.project_title',
                'projects_task.budget',
                'projects_task.project_category'
            );

        console.log('');
        console.log('API RESPONSE FOR FREELANCER:');
        console.log('-'.repeat(80));
        const relevantApp = apiResponse.find(app => app.projects_task_id === project.projects_task_id);
        if (relevantApp) {
            console.log('Project Title:', relevantApp.project_title);
            console.log('STATUS:', relevantApp.status, getStatusText(relevantApp.status));
            console.log('Rejection Reason:', relevantApp.rejection_reason || 'NULL');
            console.log('Budget:', relevantApp.budget);
        } else {
            console.log('❌ Application not found in API response!');
        }
        console.log('-'.repeat(80));
        console.log('');

        // Summary
        console.log('');
        console.log('='.repeat(80));
        console.log('DIAGNOSIS SUMMARY:');
        console.log('='.repeat(80));
        console.log('Client Email:', client.email);
        console.log('Freelancer Email:', freelancer.email);
        console.log('Project Title:', project.project_title);
        console.log('Database Status:', application.status, getStatusText(application.status));
        console.log('Rejection Reason in DB:', application.rejection_reason || 'NULL');
        console.log('');

        if (application.status === 3) {
            console.log('✅ Database shows REJECTED (status = 3)');
            console.log('⚠️  If freelancer sees "Pending", it\'s a frontend caching issue');
            console.log('💡 Solution: Freelancer needs to hard refresh (Ctrl+Shift+R)');
        } else if (application.status === 0) {
            console.log('❌ Database shows PENDING (status = 0)');
            console.log('⚠️  The rejection API call did NOT update the database');
            console.log('💡 Solution: Check backend logs for errors during rejection');
        } else {
            console.log('ℹ️  Status is:', getStatusText(application.status));
        }
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    } finally {
        process.exit(0);
    }
}

function getStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
        0: 'PENDING',
        1: 'ONGOING/APPROVED',
        2: 'COMPLETED',
        3: 'REJECTED'
    };
    return statusMap[status] || 'UNKNOWN';
}

// Run the diagnostic
diagnoseApplicationStatus();
