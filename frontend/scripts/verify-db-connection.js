require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConnection() {
    console.log('🔄 Checking Supabase connection...');
    try {
        // Try to select from a table, e.g., profiles. 
        // If table doesn't exist, it will error, which is also a good check.
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (error) {
            // If error is "relation does not exist", it means connection is good but table missing.
            if (error.code === '42P01') {
                console.warn('⚠️ Connection successful, but "profiles" table not found. Please run the schema migration.');
            } else {
                console.error('❌ Supabase error:', error.message);
            }
        } else {
            console.log('✅ Supabase connection successful!');
            console.log('✅ "profiles" table exists.');
        }
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
    }
}

checkConnection();
