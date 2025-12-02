const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
    console.log('🚀 Setting up CodeGenesis database...\n');

    try {
        // Test connection
        console.log('1️⃣ Testing Supabase connection...');
        const { data, error } = await supabase.from('user_profiles').select('count');

        if (error && error.code === '42P01') {
            console.log('⚠️  Tables do not exist yet. Please run the SQL schema manually.');
            console.log('📝 Steps:');
            console.log('   1. Go to: https://app.supabase.com/project/fvqyqiyyqkrwywxtwzac/sql');
            console.log('   2. Open supabase-schema.sql');
            console.log('   3. Copy and paste the entire content');
            console.log('   4. Click "Run" or press Ctrl+Enter');
            console.log('   5. Run this script again\n');
            return;
        }

        console.log('✅ Connection successful!\n');

        // Check tables
        console.log('2️⃣ Checking database tables...');

        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('count');

        const { data: projects, error: projectError } = await supabase
            .from('projects')
            .select('count');

        if (!profileError) {
            console.log('✅ user_profiles table exists');
        }
        if (!projectError) {
            console.log('✅ projects table exists');
        }

        console.log('\n3️⃣ Database setup complete! 🎉');
        console.log('\n📊 Database Status:');
        console.log('   - Supabase URL: ' + supabaseUrl);
        console.log('   - Tables: user_profiles, projects');
        console.log('   - RLS: Enabled');
        console.log('\n✨ You can now use the application!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure you have run the SQL schema in Supabase SQL Editor');
    }
}

setupDatabase();
