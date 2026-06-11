/**
 * Own Today - Authentication Helper
 * Handles Supabase authentication and user session management
 */

// Quotes for daily inspiration
const DAILY_QUOTES = [
    "Every day is a new beginning. Take a deep breath and start again.",
    "You are stronger than you think. Keep going!",
    "Progress, not perfection. You're doing great!",
    "One day at a time. You've got this!",
    "Your journey is unique and beautiful.",
    "Believe in yourself. Recovery is possible!",
    "Small steps lead to big changes.",
    "You are worthy of love and healing.",
    "Today is a gift. That's why it's called the present.",
    "Your story isn't over yet. Keep writing it!"
];

// Encouragement messages
const ENCOURAGEMENT_MESSAGES = [
    "You're doing amazing! Keep up the great work! 🌟",
    "Every step forward is a victory! 💪",
    "You're stronger than you know! 🦁",
    "Your progress is inspiring! Keep going! 🚀",
    "One day at a time, you're making it happen! ✨",
    "You're a warrior! Keep fighting the good fight! 🛡️",
    "Your journey matters. Keep moving forward! 🌈",
    "You're not alone. We're here for you! 💛",
    "Today's a great day to keep being awesome! 🌟",
    "You're crushing it! Stay strong! 💎"
];

/**
 * Get greeting based on time of day
 */
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return { text: "Good Morning", icon: "☀️" };
    } else if (hour < 17) {
        return { text: "Good Afternoon", icon: "🌤️" };
    } else if (hour < 21) {
        return { text: "Good Evening", icon: "🌆" };
    } else {
        return { text: "Good Night", icon: "🌙" };
    }
}

/**
 * Get random daily quote
 */
function getDailyQuote() {
    return DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
}

/**
 * Get random encouragement message
 */
function getEncouragementMessage() {
    return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
}

/**
 * Require authentication and specific role
 * @param {Array} allowedRoles - Array of allowed roles ['client', 'provider', 'staff', 'admin']
 * @returns {Object|null} - User data if authenticated, null if not
 */
async function requireAuth(allowedRoles = ['client']) {
    try {
        console.log('🔐 Checking authentication...');
        
        // Check if Supabase is configured
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase not configured - running in demo mode');
            return getDemoUser();
        }

        // Get current session
        const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
        
        if (sessionError || !session) {
            console.log('❌ No active session, redirecting to login...');
            window.location.href = 'login.html';
            return null;
        }

        const user = session.user;
        console.log('✅ User authenticated:', user.email);

        // Get user role from profiles table
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('role, full_name, avatar_url')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('❌ Error fetching user profile:', profileError);
            return getDemoUser();
        }

        const userRole = profile?.role || 'client';
        console.log('👤 User role:', userRole);

        // Check if user has required role
        if (!allowedRoles.includes(userRole) && !allowedRoles.includes('admin')) {
            console.log('⛔ Access denied - insufficient permissions');
            alert('You do not have permission to access this page.');
            window.location.href = 'client-portal.html';
            return null;
        }

        return {
            user,
            profile,
            role: userRole,
            isDemo: false
        };

    } catch (error) {
        console.error('❌ Authentication error:', error);
        return getDemoUser();
    }
}

/**
 * Get demo user data (when Supabase is not configured)
 */
function getDemoUser() {
    return {
        user: {
            id: 'demo-user-123',
            email: 'demo@owntoday.app'
        },
        profile: {
            role: 'admin',
            full_name: 'Demo User',
            avatar_url: null
        },
        role: 'admin',
        isDemo: true
    };
}

/**
 * Load user data and statistics
 */
async function loadUserData(userId, isDemo = false) {
    try {
        console.log('📊 Loading user data...');

        // Demo data if not connected to Supabase
        if (isDemo || !window.supabaseClient) {
            return {
                points: {
                    available_points: 1250,
                    total_earned: 3500
                },
                streak: {
                    current_streak: 14,
                    longest_streak: 21,
                    last_activity: new Date().toISOString()
                },
                stats: {
                    meetings_attended: 28,
                    journal_entries: 42,
                    goals_completed: 7,
                    total_points: 3500
                }
            };
        }

        // Load real data from Supabase
        const [pointsData, streakData, statsData] = await Promise.all([
            window.supabaseClient
                .from('user_points')
                .select('available_points, total_earned')
                .eq('user_id', userId)
                .single(),
            
            window.supabaseClient
                .from('user_streaks')
                .select('current_streak, longest_streak, last_activity')
                .eq('user_id', userId)
                .single(),
            
            window.supabaseClient
                .rpc('get_user_stats', { p_user_id: userId })
        ]);

        return {
            points: pointsData.data || { available_points: 0, total_earned: 0 },
            streak: streakData.data || { current_streak: 0, longest_streak: 0, last_activity: null },
            stats: statsData.data || { meetings_attended: 0, journal_entries: 0, goals_completed: 0, total_points: 0 }
        };

    } catch (error) {
        console.error('❌ Error loading user data:', error);
        // Return demo data on error
        return {
            points: { available_points: 0, total_earned: 0 },
            streak: { current_streak: 0, longest_streak: 0, last_activity: null },
            stats: { meetings_attended: 0, journal_entries: 0, goals_completed: 0, total_points: 0 }
        };
    }
}

/**
 * Calculate streak days for display
 */
function calculateStreakDays(currentStreak, lastActivity) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = lastActivity ? new Date(lastActivity) : today;
    lastDate.setHours(0, 0, 0, 0);
    
    // Calculate days to show (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Check if this day is within the streak
        const daysSinceActivity = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        const isActive = i <= currentStreak && daysSinceActivity <= 1;
        
        days.push({
            date: date,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            isActive: isActive,
            isToday: i === 0
        });
    }
    
    return days;
}

/**
 * Show celebration modal
 */
function showCelebration(title, message) {
    const modal = document.getElementById('celebration-modal');
    if (!modal) return;
    
    const titleEl = document.getElementById('celebration-title');
    const messageEl = document.getElementById('celebration-message');
    
    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    
    modal.classList.add('active');
    
    // Add confetti effect
    createConfetti();
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        closeCelebration();
    }, 5000);
}

/**
 * Close celebration modal
 */
function closeCelebration() {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Create confetti animation
 */
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.style.transition = 'all 3s ease-out';
        confetti.style.zIndex = '99999';
        confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = '50%';
        
        document.body.appendChild(confetti);
        
        // Animate
        setTimeout(() => {
            confetti.style.top = '100vh';
            confetti.style.opacity = '0';
            confetti.style.transform = 'rotate(' + (Math.random() * 720 + 360) + 'deg)';
        }, 50);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

/**
 * Check for milestones and show celebrations
 */
function checkMilestones(userData) {
    const { streak, stats } = userData;
    
    // Streak milestones
    if (streak.current_streak === 7) {
        showCelebration('🔥 7-Day Streak!', 'You\'ve kept your streak alive for a whole week! Amazing!');
    } else if (streak.current_streak === 14) {
        showCelebration('🔥 14-Day Streak!', 'Two weeks of consistency! You\'re unstoppable!');
    } else if (streak.current_streak === 30) {
        showCelebration('🔥 30-Day Streak!', 'A full month! Your dedication is inspiring!');
    } else if (streak.current_streak === 90) {
        showCelebration('🔥 90-Day Streak!', 'Three months of excellence! You\'re a champion!');
    }
    
    // Points milestones
    if (stats.total_points === 1000) {
        showCelebration('⭐ 1,000 Points!', 'You\'ve earned your first thousand points!');
    } else if (stats.total_points === 5000) {
        showCelebration('⭐ 5,000 Points!', 'Five thousand points! Incredible progress!');
    } else if (stats.total_points === 10000) {
        showCelebration('⭐ 10,000 Points!', 'Ten thousand points! You\'re a superstar!');
    }
    
    // Meeting milestones
    if (stats.meetings_attended === 10) {
        showCelebration('🏠 10 Meetings!', 'You\'ve attended 10 meetings! Keep showing up!');
    } else if (stats.meetings_attended === 50) {
        showCelebration('🏠 50 Meetings!', 'Fifty meetings! Your commitment is remarkable!');
    } else if (stats.meetings_attended === 100) {
        showCelebration('🏠 100 Meetings!', 'One hundred meetings! You\'re making a huge difference!');
    }
}

/**
 * Apply role-based feature visibility
 */
function applyRoleBasedVisibility(userRole) {
    console.log('🔒 Applying role-based feature visibility for:', userRole);

    // Hide staff-only features for non-staff
    if (userRole !== 'staff' && userRole !== 'admin') {
        const staffFeatures = document.querySelectorAll('.staff-only');
        staffFeatures.forEach(feature => {
            feature.style.display = 'none';
        });
    }

    // Hide provider-only features for non-providers
    if (userRole !== 'provider' && userRole !== 'admin') {
        const providerFeatures = document.querySelectorAll('.provider-only');
        providerFeatures.forEach(feature => {
            feature.style.display = 'none';
        });
    }

    // Hide admin-only features for non-admins
    if (userRole !== 'admin') {
        const adminFeatures = document.querySelectorAll('.admin-only');
        adminFeatures.forEach(feature => {
            feature.style.display = 'none';
        });
    }
}

/**
 * Sign out user
 */
async function signOut() {
    try {
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
        }
        
        console.log('👋 User signed out');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('❌ Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

/**
 * Award points to user
 */
async function awardPoints(userId, points, reason, isDemo = false) {
    try {
        console.log(`💰 Awarding ${points} points for: ${reason}`);
        
        if (isDemo || !window.supabaseClient) {
            console.log('⚠️ Demo mode - points not saved to database');
            return { success: true, newTotal: 0 };
        }

        // Call the award_points database function
        const { data, error } = await window.supabaseClient
            .rpc('award_points', {
                p_user_id: userId,
                p_points: points,
                p_reason: reason
            });

        if (error) throw error;

        console.log('✅ Points awarded successfully');
        return { success: true, newTotal: data };

    } catch (error) {
        console.error('❌ Error awarding points:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update user streak
 */
async function updateStreak(userId, isDemo = false) {
    try {
        console.log('🔥 Updating user streak...');
        
        if (isDemo || !window.supabaseClient) {
            console.log('⚠️ Demo mode - streak not saved to database');
            return { success: true, streak: 14 };
        }

        // Call the update_streak database function
        const { data, error } = await window.supabaseClient
            .rpc('update_streak', {
                p_user_id: userId
            });

        if (error) throw error;

        console.log('✅ Streak updated successfully');
        return { success: true, streak: data };

    } catch (error) {
        console.error('❌ Error updating streak:', error);
        return { success: false, error: error.message };
    }
}

// Export functions for use in other modules
window.authHelper = {
    requireAuth,
    loadUserData,
    getDemoUser,
    calculateStreakDays,
    showCelebration,
    closeCelebration,
    checkMilestones,
    applyRoleBasedVisibility,
    signOut,
    awardPoints,
    updateStreak,
    getGreeting,
    getDailyQuote,
    getEncouragementMessage
};
