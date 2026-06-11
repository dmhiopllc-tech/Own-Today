/**
 * Own Today - Client Portal Main Script
 * Handles dashboard initialization and data display
 */

// Initialize the portal when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Client Portal...');

    try {
        // Apply theming first
        if (window.themingEngine) {
            await window.themingEngine.init();
        }

        // Authenticate user
        const authData = await window.authHelper.requireAuth(['client', 'provider', 'staff', 'admin']);
        
        if (!authData) {
            console.log('❌ Authentication failed');
            return;
        }

        const { user, profile, role, isDemo } = authData;
        console.log('✅ Authenticated as:', profile.full_name || user.email);

        // Load user data
        const userData = await window.authHelper.loadUserData(user.id, isDemo);
        
        if (!userData) {
            console.error('❌ Failed to load user data');
            return;
        }

        // Update UI with user data
        updateWelcomeBanner(profile, userData);
        updateEncouragementBar();
        updateStreakDisplay(userData.streak);
        updateStatsGrid(userData.stats, userData.points);
        
        // Apply role-based feature visibility
        window.authHelper.applyRoleBasedVisibility(role);

        // Check for milestones
        window.authHelper.checkMilestones(userData);

        // Hide loading, show content
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        console.log('✅ Client Portal loaded successfully');

    } catch (error) {
        console.error('❌ Error initializing portal:', error);
        document.getElementById('loading-state').innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading dashboard. Please refresh the page.</p>
        `;
    }
});

/**
 * Update welcome banner with user info
 */
function updateWelcomeBanner(profile, userData) {
    const greeting = window.authHelper.getGreeting();
    const quote = window.authHelper.getDailyQuote();
    
    document.getElementById('greeting-icon').textContent = greeting.icon;
    document.getElementById('greeting-text').textContent = greeting.text;
    document.getElementById('user-name').textContent = profile.full_name || 'Friend';
    document.getElementById('daily-quote').textContent = `"${quote}"`;
}

/**
 * Update encouragement bar with random message
 */
function updateEncouragementBar() {
    const message = window.authHelper.getEncouragementMessage();
    document.getElementById('encouragement-bar').textContent = message;
}

/**
 * Update streak display
 */
function updateStreakDisplay(streak) {
    const streakDays = window.authHelper.calculateStreakDays(
        streak.current_streak,
        streak.last_activity
    );
    
    const streakContainer = document.getElementById('streak-days');
    streakContainer.innerHTML = streakDays.map(day => `
        <div class="streak-day">
            <div class="streak-circle ${day.isActive ? 'active' : ''} ${day.isToday ? 'today' : ''}">
                ${day.isActive ? '✓' : ''}
            </div>
            <div class="streak-day-label">${day.dayName}</div>
        </div>
    `).join('');
}

/**
 * Update stats grid with user statistics
 */
function updateStatsGrid(stats, points) {
    animateCounter('meetings-count', stats.meetings_attended || 0);
    animateCounter('journal-count', stats.journal_entries || 0);
    animateCounter('goals-count', stats.goals_completed || 0);
    animateCounter('points-count', points.total_earned || 0);
    
    // Update available points in rewards card
    const availablePointsEl = document.getElementById('available-points');
    if (availablePointsEl) {
        animateCounter('available-points', points.available_points || 0);
    }
}

/**
 * Animate counter from 0 to target value
 */
function animateCounter(elementId, targetValue, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = targetValue.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Initialize mobile navigation
 */
if (window.mobileNav) {
    window.mobileNav.init();
}

/**
 * PWA Install Prompt Handling
 */
let deferredPrompt;
const installBanner = document.getElementById('install-banner');
const installButton = document.getElementById('install-button');
const dismissInstall = document.getElementById('dismiss-install');

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💾 PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install banner if it exists
    if (installBanner) {
        installBanner.style.display = 'flex';
    }
});

if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('❌ No install prompt available');
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 User response to install prompt: ${outcome}`);
        
        deferredPrompt = null;
        if (installBanner) {
            installBanner.style.display = 'none';
        }
    });
}

if (dismissInstall) {
    dismissInstall.addEventListener('click', () => {
        if (installBanner) {
            installBanner.style.display = 'none';
        }
        localStorage.setItem('install-dismissed', 'true');
    });
}

window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
    if (installBanner) {
        installBanner.style.display = 'none';
    }
});

/**
 * Service Worker Registration
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Own-Today/sw.js', { scope: '/Own-Today/' })
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

/**
 * Handle online/offline status
 */
window.addEventListener('online', () => {
    console.log('✅ Back online');
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'none';
});

window.addEventListener('offline', () => {
    console.log('📡 Offline mode');
    const banner = document.getElementById('offline-banner');
    if (banner) banner.style.display = 'block';
});
