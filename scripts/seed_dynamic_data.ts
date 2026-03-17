import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { platforms, ecosystems, roles, useCases } from '../components/site/data';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.log("env variables read:", { supabaseUrl, supabaseKey });
  console.error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Roles...");
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const { error } = await supabase.from('roles').upsert({
      name: role,
      order_idx: i
    }, { onConflict: 'name' });
    if (error) console.error(`Error inserting role ${role}:`, error);
  }

  console.log("Seeding Platforms...");
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    const { error } = await supabase.from('platforms').upsert({
      id: platform.id,
      name: platform.name,
      avatar: platform.avatar,
      mental_model: platform.mentalModel,
      best_for: platform.bestFor,
      think_of_it_as: platform.thinkOfItAs,
      where_it_fits_best: platform.whereItFitsBest,
      caveat: platform.caveat,
      order_idx: i
    }, { onConflict: 'id' });
    if (error) console.error(`Error inserting platform ${platform.id}:`, error);
  }

  console.log("Seeding Ecosystems...");
  let eco_idx = 0;
  for (const eco of ecosystems) {
    const { data: ecoData, error: ecoErr } = await supabase.from('ecosystems').upsert({
      platform_id: eco.platformId,
      name: eco.name,
      order_idx: eco_idx++
    }, { onConflict: 'name' }).select().single();
    
    if (ecoErr || !ecoData) {
      console.error(`Error inserting ecosystem ${eco.name}:`, ecoErr);
      continue;
    }

    let feature_idx = 0;
    for (const feature of eco.features) {
      // the existing seed might duplicate features if we run it multiple times since we don't have a unique constraint on feature name per ecosystem in the migration constraint explicitly, so we will just try to delete existing ones or let it be for a one-time script
      const { error: fErr } = await supabase.from('ecosystem_features').upsert({
        ecosystem_id: ecoData.id,
        name: feature.name,
        description: feature.description,
        order_idx: feature_idx++
      }, { onConflict: 'name, ecosystem_id' }); // Note onConflict requires a unique constraint. We didn't add one. No big deal, we can just delete from ecosystem_features where ecosystem_id = ecoData.id first.
      
      if (fErr) {} // we'll just insert
    }
  }

  // Proper way for features without unique constraint: clear them out
  console.log("Clearing existing ecosystem_features to avoid duplicates...");
  await supabase.from('ecosystem_features').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("Re-seeding Ecosystems Features...");
  for (let eco of ecosystems) {
     const { data: ecoData } = await supabase.from('ecosystems').select('id, name').eq('name', eco.name).single();
     if (ecoData) {
        let feature_idx = 0;
        for (const feature of eco.features) {
          const { error: fErr } = await supabase.from('ecosystem_features').insert({
            ecosystem_id: ecoData.id,
            name: feature.name,
            description: feature.description,
            order_idx: feature_idx++
          });
          if (fErr) console.error(`Error inserting feature ${feature.name}:`, fErr);
        }
     }
  }


  console.log("Clearing existing use cases to avoid duplicates...");
  await supabase.from('use_cases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Seeding Use Cases...");
  let uc_idx = 0;
  for (const uc of useCases) {
    const { error } = await supabase.from('use_cases').insert({
      role_name: uc.role,
      platform_id: uc.platformId,
      headline: uc.headline,
      description: uc.description,
      order_idx: uc_idx++
    });
    if (error) console.error(`Error inserting use case ${uc.headline}:`, error);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
