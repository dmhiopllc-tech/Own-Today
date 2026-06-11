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
        window.authHelper.hideRoleBasedFeatures(role);

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
 * Update welcome banner with greeting and user info
 */
function updateWelcomeBanner(profile, userData) {
    const greeting = window.authHelper.getGreeting();
    const quote = window.authHelper.getDailyQuote();

    document.getElementById('greeting-icon').textContent = greeting.icon;
    document.getElementById('greeting-text').textContent = greeting.text + '!';
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
 * Update streak display with 7-day visualization
 */
function updateStreakDisplay(streakData) {
    const streakDaysContainer = document.getElementById('streak-days');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0

    streakDaysContainer.innerHTML = '';

    days.forEach((day, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'streak-day';

        const labelDiv = document.createElement('div');
        labelDiv.className = 'streak-day-label';
        labelDiv.textContent = day;

        const circleDiv = document.createElement('div');
        circleDiv.className = 'streak-circle';
        
        // Check if this day has activity
        const hasActivity = streakData?.streak_days?.[index] || false;
        
        if (hasActivity) {
            circleDiv.classList.add('active');
            circleDiv.textContent = '✓';
        } else {
            circleDiv.textContent = '○';
        }

        // Mark today with special styling
        if (index === todayIndex) {
            circleDiv.classList.add('today');
        }

        dayDiv.appendChild(labelDiv);
        dayDiv.appendChild(circleDiv);
        streakDaysContainer.appendChild(dayDiv);
    });

    // If user has a current streak, update encouragement
    if (streakData?.current_streak > 0) {
        const streakHeader = document.querySelector('.streak-header');
        streakHeader.textContent = `YOUR MOMENTUM - ${streakData.current_streak} DAY STREAK 🔥`;
    }
}

/**
 * Update stats grid with user statistics
 */
function updateStatsGrid(stats, points) {
    // Animate numbers counting up
    animateCounter('meetings-count', 0, stats.meetings || 0, 1000);
    animateCounter('journal-count', 0, stats.journals || 0, 1000);
    animateCounter('goals-count', 0, stats.goals || 0, 1000);
    animateCounter('points-count', 0, points.total_earned || 0, 1500);
    
    // Update available points in rewards card
    const availablePointsEl = document.getElementById('available-points');
    if (availablePointsEl) {
        animateCounter('available-points', 0, points.available_points || 0, 1000);
    }
}

/**
 * Animate number counting effect
 */
function animateCounter(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

/**
 * Handle feature card clicks (can add analytics here)
 */
document.addEventListener('click', function(e) {
    const featureCard = e.target.closest('.feature-card');
    if (featureCard) {
        const featureName = featureCard.querySelector('h3')?.textContent;
        console.log('📍 Feature clicked:', featureName);
        // Could send analytics here
    }
});

/**
 * Handle celebration modal close
 */
window.closeCelebration = function() {
    window.authHelper.closeCelebration();
};

/**
 * Add pull-to-refresh functionality for mobile
 */
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeDistance = touchEndY - touchStartY;
    
    // If user swiped down from top of page
    if (swipeDistance > 100 && window.scrollY === 0) {
        console.log('🔄 Pull to refresh detected');
        location.reload();
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.location.href = 'search.html';
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        window.authHelper.closeCelebration();
    }
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/Own-Today/sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(function(error) {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Add install prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
    console.log('💾 Install prompt available');
    e.preventDefault();
    deferredPrompt = e;
    
    // Could show a custom install button here
    showInstallButton();
});

function showInstallButton() {
    // Create install banner if it doesn't exist
    if (document.getElementById('install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 15px 25px;
        border-radius: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideUp 0.3s ease;
    `;

    banner.innerHTML = `
        <span>📱</span>
        <span style="font-weight: 600;">Install Own Today app</span>
        <button id="install-button" style="
            background: linear-gradient(135deg, var(--org-primary, #667eea), var(--org-secondary, #764ba2));
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            cursor: pointer;
        ">Install</button>
        <button id="dismiss-install" style="
            background: transparent;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 20px;
        ">×</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('install-button').addEventListener('click', async function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('📱 Install outcome:', outcome);
            deferredPrompt = null;
            banner.remove();
        }
    });

    document.getElementById('dismiss-install').addEventListener('click', function() {
        banner.remove();
    });
}

console.log('📄 client-portal.js loaded');
