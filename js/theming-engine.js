/**
 * OWN TODAY - WHITE LABEL THEMING ENGINE
 * 
 * This module handles dynamic theme application based on organization branding.
 */

// ==========================================
// CONFIGURATION
// ==========================================

// YOUR SUPABASE CREDENTIALS GO HERE:
// Replace these with your actual Supabase project details

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Default Own Today branding (used when no organization is detected)
const DEFAULT_BRANDING = {
    name: 'Own Today',
    logo_url: 'https://www.genspark.ai/api/files/s/LuSkQujA',
    primary_color: '#0D7C9E',
    secondary_color: '#F89A2E',
    accent_color: '#F89A2E'
};

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// THEME CACHE
// ==========================================

let currentTheme = null;
let organizationData = null;

// ==========================================
// DETECT ORGANIZATION FROM URL
// ==========================================

function detectOrganization() {
    // Method 1: Subdomain
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length >= 3 && parts[0] !== 'www') {
        return parts[0];
    }
    
    // Method 2: URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orgParam = urlParams.get('org');
    if (orgParam) {
        return orgParam;
    }
    
    // Method 3: LocalStorage
    const cachedOrg = localStorage.getItem('own_today_org');
    if (cachedOrg) {
        return cachedOrg;
    }
    
    return null;
}

// ==========================================
// LOAD ORGANIZATION DATA
// ==========================================

async function loadOrganizationData(subdomain) {
    try {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('subdomain', subdomain)
            .eq('active', true)
            .single();
        
        if (error) {
            console.error('Error loading organization:', error);
            return null;
        }
        
        organizationData = data;
        localStorage.setItem('own_today_org', subdomain);
        localStorage.setItem('own_today_org_data', JSON.stringify(data));
        
        return data;
    } catch (err) {
        console.error('Failed to load organization:', err);
        return null;
    }
}

// ==========================================
// APPLY THEME
// ==========================================

function applyTheme(organization) {
    if (!organization) {
        console.warn('No organization data provided, using default Own Today branding');
        organization = DEFAULT_BRANDING;
    }
    
    currentTheme = organization;
    
    // Apply CSS Variables
    const root = document.documentElement;
    
    root.style.setProperty('--org-primary', organization.primary_color || '#4A9FBF');
    root.style.setProperty('--org-secondary', organization.secondary_color || '#3A8FAF');
    root.style.setProperty('--org-accent', organization.accent_color || '#F59E0B');
    
    // Replace Logo Images
    const logoElements = document.querySelectorAll('[data-org-logo]');
    logoElements.forEach(img => {
        if (organization.logo_url) {
            img.src = organization.logo_url;
            img.alt = `${organization.name} Logo`;
        }
    });
    
    // Replace Organization Name
    const nameElements = document.querySelectorAll('[data-org-name]');
    nameElements.forEach(el => {
        el.textContent = organization.name;
    });
    
    // Replace Contact Information
    if (organization.contact_email) {
        const emailElements = document.querySelectorAll('[data-org-email]');
        emailElements.forEach(el => {
            el.textContent = organization.contact_email;
            if (el.tagName === 'A') {
                el.href = `mailto:${organization.contact_email}`;
            }
        });
    }
    
    console.log('✅ Theme applied for:', organization.name);
}

// ==========================================
// INITIALIZATION
// ==========================================

async function initializeTheming() {
    const orgSubdomain = detectOrganization();
    
    if (!orgSubdomain) {
        console.log('No organization detected. Using default Own Today branding.');
        applyTheme(DEFAULT_BRANDING);
        return;
    }
    
    // Try cache first
    const cachedData = localStorage.getItem('own_today_org_data');
    if (cachedData) {
        try {
            const cached = JSON.parse(cachedData);
            applyTheme(cached);
        } catch (e) {
            console.error('Failed to parse cached theme:', e);
        }
    }
    
    // Load fresh data
    const orgData = await loadOrganizationData(orgSubdomain);
    
    if (orgData) {
        applyTheme(orgData);
    } else {
        console.warn('Organization not found, using default Own Today branding');
        applyTheme(DEFAULT_BRANDING);
    }
}

// ==========================================
// PUBLIC API
// ==========================================

function getCurrentOrganization() {
    return organizationData;
}

function getOrganizationSetting(key, defaultValue = null) {
    if (!organizationData || !organizationData.settings) {
        return defaultValue;
    }
    return organizationData.settings[key] || defaultValue;
}

function isFeatureEnabled(featureName) {
    if (!organizationData || !organizationData.feature_flags) {
        return true;
    }
    return organizationData.feature_flags[featureName] !== false;
}

// ==========================================
// AUTO-INITIALIZE
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheming);
} else {
    initializeTheming();
}

// ==========================================
// EXPORT FOR MODULE USAGE
// ==========================================

window.OwnTodayTheming = {
    initialize: initializeTheming,
    getCurrentOrganization,
    getOrganizationSetting,
    isFeatureEnabled,
    applyTheme
};
