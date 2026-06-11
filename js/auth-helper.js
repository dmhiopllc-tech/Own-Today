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
            return null;
        }

        const userRole = profile?.role || 'client';
        console.log('👤 User role:', userRole);

        // Check if user has required role
        if (!allowedRoles.includes(userRole)) {
            console.log('⛔ Access denied - insufficient permissions');
            alert('You do not have permission to access this page.');
            window.location.href = 'client-portal.html';
            return null;
        }

        return {
            user,
            profile,
            role: userRole
        };

    } catch (error) {
        console.error('❌ Authentication error:', error);
        return null;
    }
}

/**
 * Get demo user for testing without Supabase
 */
function getDemoUser() {
    return {
        user: {
            id: 'demo-user-123',
            email: 'demo@owntoday.app'
        },
        profile: {
            role: 'client',
            full_name: 'Demo User',
            avatar_url: null
        },
        role: 'client',
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
                stats: {
                    meetings: 28,
                    journals: 42,
                    goals: 7
                },
                streak: {
                    current_streak: 14,
                    last_activity: new Date()
                }
            };
        }

        // Load from Supabase
        const [pointsData, checkInsData, journalsData, goalsData] = await Promise.all([
            window.supabaseClient
                .from('user_points')
                .select('available_points, total_earned')
                .eq('user_id', userId)
                .single(),
            
            window.supabaseClient
                .from('check_ins')
                .select('id')
                .eq('user_id', userId),
            
            window.supabaseClient
                .from('journal_entries')
                .select('id')
                .eq('user_id', userId),
            
            window.supabaseClient
                .from('goals')
                .select('id')
                .eq('user_id', userId)
                .eq('completed', true)
        ]);

        return {
            points: pointsData.data || { available_points: 0, total_earned: 0 },
            stats: {
                meetings: checkInsData.data?.length || 0,
                journals: journalsData.data?.length || 0,
                goals: goalsData.data?.length || 0
            },
            streak: await calculateStreak(userId)
        };

    } catch (error) {
        console.error('❌ Error loading user data:', error);
        return null;
    }
}

/**
 * Calculate user's current streak
 */
async function calculateStreak(userId) {
    try {
        if (!window.supabaseClient) {
            // Demo streak data
            return {
                current_streak: 14,
                last_activity: new Date(),
                streak_days: [true, true, true, true, true, true, true] // All 7 days active
            };
        }

        // Get all check-ins for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: checkIns, error } = await window.supabaseClient
            .from('check_ins')
            .select('check_in_time')
            .eq('user_id', userId)
            .gte('check_in_time', thirtyDaysAgo.toISOString())
            .order('check_in_time', { ascending: false });

        if (error) throw error;

        // Calculate streak
        let currentStreak = 0;
        let lastDate = new Date();
        lastDate.setHours(0, 0, 0, 0);

        for (const checkIn of checkIns) {
            const checkInDate = new Date(checkIn.check_in_time);
            checkInDate.setHours(0, 0, 0, 0);

            const dayDiff = Math.floor((lastDate - checkInDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === currentStreak) {
                currentStreak++;
                lastDate = checkInDate;
            } else if (dayDiff > currentStreak) {
                break;
            }
        }

        // Get last 7 days activity
        const streak_days = Array(7).fill(false);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            
            const hasActivity = checkIns.some(checkIn => {
                const ciDate = new Date(checkIn.check_in_time);
                ciDate.setHours(0, 0, 0, 0);
                return ciDate.getTime() === checkDate.getTime();
            });

            streak_days[6 - i] = hasActivity;
        }

        return {
            current_streak: currentStreak,
            last_activity: checkIns.length > 0 ? new Date(checkIns[0].check_in_time) : null,
            streak_days
        };

    } catch (error) {
        console.error('❌ Error calculating streak:', error);
        return {
            current_streak: 0,
            last_activity: null,
            streak_days: Array(7).fill(false)
        };
    }
}

/**
 * Show celebration modal
 */
function showCelebration(title, message) {
    const modal = document.getElementById('celebration-modal');
    const titleEl = document.getElementById('celebration-title');
    const messageEl = document.getElementById('celebration-message');

    if (modal && titleEl && messageEl) {
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('active');

        // Add confetti effect (simple version)
        createConfetti();
    }
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
 * Create confetti effect
 */
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.opacity = '1';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';
            
            document.body.appendChild(confetti);

            const duration = Math.random() * 3000 + 2000;
            const fallDistance = window.innerHeight + 20;
            const horizontalMovement = (Math.random() - 0.5) * 200;

            confetti.animate([
                { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${fallDistance}px) translateX(${horizontalMovement}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                confetti.remove();
            };
        }, i * 30);
    }
}

/**
 * Check for milestone achievements
 */
function checkMilestones(stats) {
    // Check for streak milestones
    if (stats.streak?.current_streak === 7) {
        showCelebration('🔥 7 Day Streak!', 'You\'re on fire! Keep the momentum going!');
    } else if (stats.streak?.current_streak === 30) {
        showCelebration('🌟 30 Day Streak!', 'You\'re unstoppable! What an achievement!');
    } else if (stats.streak?.current_streak === 100) {
        showCelebration('💎 100 Day Streak!', 'You\'re a legend! This is incredible!');
    }

    // Check for meeting milestones
    if (stats.stats?.meetings === 10) {
        showCelebration('🏠 10 Meetings!', 'You\'re building a strong foundation!');
    } else if (stats.stats?.meetings === 50) {
        showCelebration('🏆 50 Meetings!', 'Your commitment is inspiring!');
    } else if (stats.stats?.meetings === 100) {
        showCelebration('🌟 100 Meetings!', 'You\'re a recovery champion!');
    }

    // Check for journal milestones
    if (stats.stats?.journals === 30) {
        showCelebration('📖 30 Journal Entries!', 'Your self-reflection is powerful!');
    }

    // Check for goals milestones
    if (stats.stats?.goals === 5) {
        showCelebration('🎯 5 Goals Achieved!', 'You\'re making dreams happen!');
    } else if (stats.stats?.goals === 10) {
        showCelebration('🏆 10 Goals Achieved!', 'Nothing can stop you now!');
    }
}

/**
 * Hide features based on user role
 */
function hideRoleBasedFeatures(userRole) {
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
            await window.supabaseClient.auth.signOut();
        }
        window.location.href = 'login.html';
    } catch (error) {
        console.error('❌ Error signing out:', error);
    }
}

// Export functions for use in other scripts
window.authHelper = {
    requireAuth,
    loadUserData,
    getGreeting,
    getDailyQuote,
    getEncouragementMessage,
    showCelebration,
    closeCelebration,
    checkMilestones,
    hideRoleBasedFeatures,
    signOut
};
