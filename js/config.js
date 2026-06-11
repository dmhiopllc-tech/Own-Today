/**
 * Own Today - Configuration
 * Supabase credentials
 */

// Configure Supabase connection (optional - works in demo mode without this)
const SUPABASE_CONFIG = {
    url: '', // Leave empty for demo mode
    anonKey: '' // Leave empty for demo mode
};

// Initialize Supabase client if credentials provided
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    const { createClient } = supabase;
    window.supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✅ Supabase client initialized');
} else {
    console.log('⚠️ Running in demo mode (no Supabase configured)');
    window.supabaseClient = null;
}
