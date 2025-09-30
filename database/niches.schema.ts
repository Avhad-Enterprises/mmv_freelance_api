import DB from './index.schema';

export const NICHES_TABLE = 'niches';

export const EDITOR_NICHES = [
    'ShortFormReels', 'CorporateAV', 'Documentary', 'EventHighlight', 'WeddingFilm',
    'CommercialAd', 'MusicVideo', 'NarrativeFilm', 'VFXCompositing', 'MotionGraphics',
    'GamingEsports', 'SportsHighlight', 'eLearning', 'RealEstate', 'Colourist'
];

export const VIDEOGRAPHER_NICHES = [
    'RunAndGunSocial', 'CorporateInterview', 'DocumentaryField', 'WeddingCine', 'EventCoverage',
    'ProductShooter', 'MusicVideoDP', 'SportsAction', 'DroneOperator', 'RealEstateCine',
    'FashionBeauty', 'MultiCamLive', 'Wildlife', 'HighSpeedSpecialist', 'VR360'
];

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(NICHES_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        
        await DB.schema.createTable(NICHES_TABLE, table => {
            table.increments('niche_id').primary();
            table.string("niche_name").notNullable().unique();
            table.enu('niche_type', ['editor', 'videographer']).notNullable();
            table.text('description').nullable();

            // compulsory columns
            table.boolean("is_active").defaultTo(true);
            table.boolean("is_deleted").defaultTo(false);
            table.integer("deleted_by").nullable();
            table.timestamp("deleted_at").nullable();
            table.integer("created_by").nullable();
            table.integer("updated_by").nullable();
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        
        await DB.raw(`
          CREATE OR REPLACE FUNCTION update_timestamp()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

        await DB.raw(`
          DROP TRIGGER IF EXISTS update_timestamp ON ${NICHES_TABLE};
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${NICHES_TABLE}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);
        
        console.log('Finished Creating Triggers');

        // Insert all editor niches
        console.log('Inserting Editor Niches');
        for (const niche of EDITOR_NICHES) {
            await DB(NICHES_TABLE).insert({
                niche_name: niche,
                niche_type: 'editor',
                description: `${niche} editing services`,
                is_active: true,
                is_deleted: false
            });
        }

        // Insert all videographer niches
        console.log('Inserting Videographer Niches');
        for (const niche of VIDEOGRAPHER_NICHES) {
            await DB(NICHES_TABLE).insert({
                niche_name: niche,
                niche_type: 'videographer',
                description: `${niche} videography services`,
                is_active: true,
                is_deleted: false
            });
        }

        console.log('All niches inserted successfully');
        
    } catch (error) {
        console.log(error);
    }
};

//   exports.seed = seed;
//  const run = async () => {
//     //createProcedure();
//      seed();
//  };
//  run();
