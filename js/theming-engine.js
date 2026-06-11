/**
 * OWN TODAY - WHITE LABEL THEMING ENGINE
 * 
 * This module handles dynamic theme application based on organization branding.
 * It loads organization-specific colors, logos, and styling without requiring
 * code changes or redeployment.
 */

// ==========================================
// CONFIGURATION
// ==========================================

// Default Own Today branding (used when no organization is detected)
const DEFAULT_BRANDING = {
    name: 'Own Today',
    logo_url: 'https://www.genspark.ai/api/files/s/LuSkQujA',
    primary_color: '#0D7C9E',
    secondary_color: '#F89A2E',
    accent_color: '#F89A2E'
};

// ==========================================
// THEME CACHE
// ==========================================

let currentTheme = null;
let organizationData = null;

// ==========================================
// DETECT ORGANIZATION FROM URL
// ==========================================

/**
 * Detect organization identifier from various sources
 * Priority: URL parameter > subdomain > localStorage
 */
function detectOrganization() {
    // 1. Check URL parameter (?org=mountainview)
    const urlParams = new URLSearchParams(window.location.search);
    const orgParam = urlParams.get('org');
    if (orgParam) {
        localStorage.setItem('currentOrganization', orgParam);
        return orgParam;
    }

    // 2. Check subdomain (mountainview.owntoday.app)
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
        const subdomain = parts[0];
        localStorage.setItem('currentOrganization', subdomain);
        return subdomain;
    }

    // 3. Check localStorage (from previous visit)
    const storedOrg = localStorage.getItem('currentOrganization');
    if (storedOrg) {
        return storedOrg;
    }

    // No organization detected - use default
    return null;
}

// ==========================================
// LOAD ORGANIZATION DATA
// ==========================================

/**
 * Load organization branding data from Supabase
 */
async function loadOrganizationData(subdomain) {
    try {
        // Check if Supabase client exists
        if (!window.supabaseClient) {
            console.log('⚠️ Supabase not configured, using default branding');
            return DEFAULT_BRANDING;
        }

        const { data, error } = await window.supabaseClient
            .from('organizations')
            .select('*')
            .eq('subdomain', subdomain)
            .eq('active', true)
            .single();

        if (error) {
            console.warn('Organization not found, using default branding:', error);
            return DEFAULT_BRANDING;
        }

        return data;
    } catch (error) {
        console.error('Error loading organization data:', error);
        return DEFAULT_BRANDING;
    }
}

// ==========================================
// APPLY THEME
// ==========================================

/**
 * Apply organization theme to the page
 */
function applyTheme(organization) {
    if (!organization) {
        organization = DEFAULT_BRANDING;
    }

    console.log('🎨 Applying theme for:', organization.name);

    // Store in cache
    currentTheme = organization;
    organizationData = organization;

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--org-primary', organization.primary_color);
    root.style.setProperty('--org-secondary', organization.secondary_color);
    root.style.setProperty('--org-accent', organization.accent_color);

    // Replace logos
    const logos = document.querySelectorAll('img[alt*="logo" i], .logo img, .header-logo, .footer-logo');
    logos.forEach(logo => {
        logo.src = organization.logo_url;
    });

    // Replace organization name in text
    const nameElements = document.querySelectorAll('.org-name, [data-org-name]');
    nameElements.forEach(el => {
        el.textContent = organization.name;
    });

    // Update page title
    if (document.title.includes('Own Today')) {
        document.title = document.title.replace('Own Today', organization.name);
    }

    // Update meta tags
    const metaTags = document.querySelectorAll('meta[content*="Own Today"]');
    metaTags.forEach(meta => {
        if (meta.content) {
            meta.content = meta.content.replace('Own Today', organization.name);
        }
    });

    console.log('✅ Theme applied successfully');
}

// ==========================================
// INITIALIZE
// ==========================================

/**
 * Initialize theming engine
 */
async function init() {
    console.log('🚀 Initializing Theming Engine...');

    try {
        // Detect organization
        const orgIdentifier = detectOrganization();

        if (orgIdentifier) {
            console.log('🏢 Organization detected:', orgIdentifier);
            
            // Load organization data
            const orgData = await loadOrganizationData(orgIdentifier);
            
            // Apply theme
            applyTheme(orgData);
        } else {
            console.log('🏢 No organization detected, using default branding');
            applyTheme(DEFAULT_BRANDING);
        }

        return true;
    } catch (error) {
        console.error('❌ Error initializing theming engine:', error);
        applyTheme(DEFAULT_BRANDING);
        return false;
    }
}

// ==========================================
// PUBLIC API
// ==========================================

window.themingEngine = {
    init,
    applyTheme,
    detectOrganization,
    loadOrganizationData,
    getCurrentTheme: () => currentTheme,
    getOrganizationData: () => organizationData,
    DEFAULT_BRANDING
};

// Auto-initialize when DOM is ready (if not already initialized)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!currentTheme) {
            init();
        }
    });
} else {
    if (!currentTheme) {
        init();
    }
}

console.log('✅ Theming Engine loaded');
