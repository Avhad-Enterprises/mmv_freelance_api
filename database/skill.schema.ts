// To migrate this schema: npm run migrate:schema -- skill [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- skill
//    - Creates/updates the skills table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- skill --drop
//    - Completely drops and recreates the skills table from scratch
//
import DB from './index';

export const SKILLS = 'skills';

const SKILL_DATA = [
    'Creative Direction',
    'Concept Development',
    'Mood Boards',
    'Script Writing',
    'Screenwriting',
    'Production Planning',
    'Budgeting',
    'Scheduling',
    'Casting',
    'Location Scouting',
    'Prop Sourcing',
    'Costume Design',
    'Storyboarding',
    'Shot List Creation',
    'Pre-visualization (Previs)',
    'Production Design',
    'Lighting Setup Planning',
    'Cinematography',
    'Camera Operation',
    'Multi-Cam Setup',
    'Drone Videography',
    '360°/VR Filming',
    'Green Screen Filming',
    'Lighting Setup',
    'Sound Recording',
    'Boom Operation',
    'Live Streaming',
    'Directing',
    'Color Correction',
    'Color Grading',
    'LUTs Application',
    'VFX (Visual Effects)',
    'CGI',
    'Rotoscoping',
    'Green Screen Keying',
    'Motion Graphics',
    '2D Animation',
    '3D Animation',
    'Character Animation',
    'Explainer Videos',
    'Infographic Animation',
    'Audio Editing',
    'Sound Design',
    'Foley',
    'Voiceover Editing',
    'ADR (Automated Dialogue Replacement)',
    'Mixing & Mastering',
    'Background Score',
    'Subtitling',
    'Closed Captioning',
    'Multi-language Subtitles',
    'Aspect Ratio Formatting (16:9, 9:16, 1:1 etc.)',
    'Video Compression & Export',
    'YouTube Optimization',
    'Social Media Video Formatting',
    'Adobe Premiere Pro',
    'Final Cut Pro',
    'DaVinci Resolve',
    'Avid Media Composer',
    'Sony Vegas Pro',
    'Adobe After Effects',
    'Blender',
    'Cinema 4D',
    'Maya',
    '3ds Max',
    'Adobe Audition',
    'Pro Tools',
    'Logic Pro',
    'Audacity'
];

export const migrate = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(SKILLS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(SKILLS, table => {
            table.increments('skill_id').primary(); // ID
            table.string('skill_name').notNullable();

            // Status and Soft Delete fields
            table.boolean("is_active").defaultTo(true);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now())
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        });

        console.log('Inserting skill data...');
        const skillInserts = SKILL_DATA.map(skill => ({
            skill_name: skill,
            created_by: 1 // Assuming admin user ID 1
        }));
        await DB(SKILLS).insert(skillInserts);
        console.log(`Inserted ${SKILL_DATA.length} skills`);

        console.log('Finished Seeding Tables');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SKILLS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Version: 1.0.0 - Skills lookup table for freelancer skills
