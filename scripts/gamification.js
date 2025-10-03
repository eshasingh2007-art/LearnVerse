// Gamification and Achievement System
class GamificationManager {
    constructor() {
        this.achievements = {
            firstQuiz: {
                id: 'first_quiz',
                name: 'Getting Started',
                description: 'Complete your first quiz',
                icon: '🚀',
                points: 50,
                condition: (stats) => stats.totalQuizzes >= 1
            },
            perfectScore: {
                id: 'perfect_score',
                name: 'Perfect Score',
                description: 'Score 100% on any quiz',
                icon: '🎯',
                points: 100,
                condition: (stats, quizResult) => quizResult && quizResult.score === 100
            },
            streak7: {
                id: 'streak_7',
                name: '7-Day Streak',
                description: 'Take quizzes for 7 consecutive days',
                icon: '🔥',
                points: 200,
                condition: (stats) => stats.longestStreak >= 7
            },
            streak30: {
                id: 'streak_30',
                name: 'Monthly Master',
                description: 'Take quizzes for 30 consecutive days',
                icon: '👑',
                points: 500,
                condition: (stats) => stats.longestStreak >= 30
            },
            speedster: {
                id: 'speedster',
                name: 'Speed Demon',
                description: 'Complete a quiz in under 2 minutes',
                icon: '⚡',
                points: 75,
                condition: (stats, quizResult) => quizResult && quizResult.timeSpent < 120
            },
            mathWiz: {
                id: 'math_wiz',
                name: 'Math Wizard',
                description: 'Score 90%+ on 5 math quizzes',
                icon: '🧮',
                points: 150,
                condition: (stats) => {
                    const mathStats = stats.subjectStats?.mathematics;
                    return mathStats && mathStats.quizzesTaken >= 5 && mathStats.averageScore >= 90;
                }
            },
            scienceExplorer: {
                id: 'science_explorer',
                name: 'Science Explorer',
                description: 'Score 85%+ on 5 science quizzes',
                icon: '🔬',
                points: 150,
                condition: (stats) => {
                    const scienceStats = stats.subjectStats?.science;
                    return scienceStats && scienceStats.quizzesTaken >= 5 && scienceStats.averageScore >= 85;
                }
            },
            bookworm: {
                id: 'bookworm',
                name: 'Bookworm',
                description: 'Score 85%+ on 5 English quizzes',
                icon: '📚',
                points: 150,
                condition: (stats) => {
                    const englishStats = stats.subjectStats?.english;
                    return englishStats && englishStats.quizzesTaken >= 5 && englishStats.averageScore >= 85;
                }
            },
            socialScientist: {
                id: 'social_scientist',
                name: 'Social Scientist',
                description: 'Score 85%+ on 5 social studies quizzes',
                icon: '🌍',
                points: 150,
                condition: (stats) => {
                    const socialStats = stats.subjectStats?.social;
                    return socialStats && socialStats.quizzesTaken >= 5 && socialStats.averageScore >= 85;
                }
            },
            consistent: {
                id: 'consistent',
                name: 'Consistency Champion',
                description: 'Take 10 quizzes with average 80%+',
                icon: '📈',
                points: 250,
                condition: (stats) => stats.totalQuizzes >= 10 && stats.averageScore >= 80
            },
            overachiever: {
                id: 'overachiever',
                name: 'Overachiever',
                description: 'Complete 50 quizzes',
                icon: '🌟',
                points: 300,
                condition: (stats) => stats.totalQuizzes >= 50
            },
            master: {
                id: 'master',
                name: 'Quiz Master',
                description: 'Complete 100 quizzes with 85%+ average',
                icon: '👑',
                points: 500,
                condition: (stats) => stats.totalQuizzes >= 100 && stats.averageScore >= 85
            }
        };
        
        this.levels = [
            { level: 1, name: 'Beginner', minPoints: 0, maxPoints: 199, color: '#94a3b8' },
            { level: 2, name: 'Student', minPoints: 200, maxPoints: 499, color: '#3b82f6' },
            { level: 3, name: 'Scholar', minPoints: 500, maxPoints: 999, color: '#8b5cf6' },
            { level: 4, name: 'Expert', minPoints: 1000, maxPoints: 1999, color: '#f59e0b' },
            { level: 5, name: 'Master', minPoints: 2000, maxPoints: 3999, color: '#ef4444' },
            { level: 6, name: 'Grandmaster', minPoints: 4000, maxPoints: 7999, color: '#10b981' },
            { level: 7, name: 'Legend', minPoints: 8000, maxPoints: 15999, color: '#6366f1' },
            { level: 8, name: 'Mythical', minPoints: 16000, maxPoints: Infinity, color: '#ec4899' }
        ];
        
        console.log('🏆 Gamification Manager initialized');
    }

    // Check and award achievements after quiz completion
    async checkAchievements(userId, quizResult) {
        try {
            console.log('🏆 Checking achievements for user:', userId);
            
            // Get current user stats
            const userProfile = await window.firebaseManager.getUserProfile(userId);
            if (!userProfile || !userProfile.stats) {
                console.log('⚠️ No user stats found');
                return;
            }
            
            const stats = userProfile.stats;
            const currentAchievements = userProfile.achievements || [];
            
            // Check each achievement
            for (const [key, achievement] of Object.entries(this.achievements)) {
                // Skip if already earned
                if (currentAchievements.find(a => a.id === achievement.id)) {
                    continue;
                }
                
                // Check if condition is met
                if (achievement.condition(stats, quizResult)) {
                    console.log('🎉 Achievement unlocked:', achievement.name);
                    
                    // Award achievement
                    await window.firebaseManager.updateUserAchievements(userId, achievement);
                    
                    // Show achievement notification
                    this.showAchievementNotification(achievement);
                    
                    // Award points
                    await this.awardPoints(userId, achievement.points);
                }
            }
            
        } catch (error) {
            console.error('❌ Error checking achievements:', error);
        }
    }

    // Award points to user
    async awardPoints(userId, points) {
        try {
            const userRef = window.db.collection('students').doc(userId);
            await window.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data();
                
                const currentPoints = userData.gamification?.totalPoints || 0;
                const newPoints = currentPoints + points;
                
                // Calculate level
                const newLevel = this.calculateLevel(newPoints);
                const oldLevel = this.calculateLevel(currentPoints);
                
                const gamificationData = {
                    totalPoints: newPoints,
                    currentLevel: newLevel,
                    lastPointsAwarded: points,
                    lastAwardDate: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                transaction.update(userRef, { 
                    'gamification': gamificationData 
                });
                
                // Show level up notification if applicable
                if (newLevel.level > oldLevel.level) {
                    this.showLevelUpNotification(newLevel);
                }
                
                console.log(`💰 Awarded ${points} points. Total: ${newPoints}`);
            });
        } catch (error) {
            console.error('❌ Error awarding points:', error);
        }
    }

    // Calculate user level based on points
    calculateLevel(points) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];
            if (points >= level.minPoints) {
                const progress = points > level.maxPoints ? 100 : 
                    ((points - level.minPoints) / (level.maxPoints - level.minPoints)) * 100;
                
                return {
                    ...level,
                    progress: Math.round(progress),
                    pointsInLevel: points - level.minPoints,
                    pointsToNext: level.maxPoints === Infinity ? 0 : level.maxPoints - points + 1
                };
            }
        }
        return this.levels[0];
    }

    // Show achievement unlock notification
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-details">
                    <h4>Achievement Unlocked!</h4>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    <span class="achievement-points">+${achievement.points} points</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
        
        // Manual close
        notification.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        });
        
        // Play achievement sound (if available)
        this.playAchievementSound();
    }

    // Show level up notification
    showLevelUpNotification(newLevel) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">🎊</div>
                <div class="level-up-details">
                    <h4>Level Up!</h4>
                    <h3>Level ${newLevel.level}: ${newLevel.name}</h3>
                    <p>You've reached a new level!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
        
        this.playLevelUpSound();
    }

    // Get leaderboard data
    async getLeaderboard(limit = 10) {
        try {
            console.log('📊 Fetching leaderboard...');
            
            const query = await window.db.collection('students')
                .where('gamification.totalPoints', '>', 0)
                .orderBy('gamification.totalPoints', 'desc')
                .limit(limit)
                .get();
            
            const leaderboard = [];
            let rank = 1;
            
            query.forEach(doc => {
                const data = doc.data();
                leaderboard.push({
                    rank: rank++,
                    name: data.name || 'Anonymous',
                    points: data.gamification?.totalPoints || 0,
                    level: this.calculateLevel(data.gamification?.totalPoints || 0),
                    grade: data.grade,
                    board: data.board
                });
            });
            
            console.log('✅ Leaderboard fetched:', leaderboard.length, 'entries');
            return leaderboard;
        } catch (error) {
            console.error('❌ Error fetching leaderboard:', error);
            return [];
        }
    }

    // Get user's current rank
    async getUserRank(userId) {
        try {
            const userProfile = await window.firebaseManager.getUserProfile(userId);
            const userPoints = userProfile?.gamification?.totalPoints || 0;
            
            const query = await window.db.collection('students')
                .where('gamification.totalPoints', '>', userPoints)
                .get();
            
            return query.size + 1; // Add 1 because ranks start at 1
        } catch (error) {
            console.error('❌ Error getting user rank:', error);
            return null;
        }
    }

    // Update daily streak
    async updateDailyStreak(userId) {
        try {
            const userRef = window.db.collection('students').doc(userId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            await window.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data();
                
                const streakData = userData.streakData || {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActiveDate: null
                };
                
                const lastActive = streakData.lastActiveDate?.toDate();
                
                if (!lastActive) {
                    // First time
                    streakData.currentStreak = 1;
                    streakData.longestStreak = 1;
                } else {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (lastActive.getTime() === yesterday.getTime()) {
                        // Consecutive day
                        streakData.currentStreak += 1;
                        streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
                    } else if (lastActive.getTime() < yesterday.getTime()) {
                        // Streak broken
                        streakData.currentStreak = 1;
                    }
                    // If same day, no change needed
                }
                
                streakData.lastActiveDate = firebase.firestore.Timestamp.fromDate(today);
                
                transaction.update(userRef, { 
                    streakData,
                    'stats.longestStreak': streakData.longestStreak,
                    'stats.currentStreak': streakData.currentStreak
                });
                
                console.log(`🔥 Streak updated: ${streakData.currentStreak} days`);
            });
        } catch (error) {
            console.error('❌ Error updating streak:', error);
        }
    }

    // Play achievement sound
    playAchievementSound() {
        try {
            // Create audio context for achievement sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('🔇 Audio not available');
        }
    }

    // Play level up sound
    playLevelUpSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
            oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1); // E4
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime + 0.2); // G4
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.3); // C5
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
        } catch (error) {
            console.log('🔇 Audio not available');
        }
    }

    // Get user's progress summary
    async getUserProgress(userId) {
        try {
            const userProfile = await window.firebaseManager.getUserProfile(userId);
            if (!userProfile) return null;
            
            const points = userProfile.gamification?.totalPoints || 0;
            const level = this.calculateLevel(points);
            const achievements = userProfile.achievements || [];
            const stats = userProfile.stats || {};
            
            return {
                level,
                points,
                achievements: achievements.length,
                totalAchievements: Object.keys(this.achievements).length,
                quizzesTaken: stats.totalQuizzes || 0,
                averageScore: Math.round(stats.averageScore || 0),
                currentStreak: stats.currentStreak || 0,
                longestStreak: stats.longestStreak || 0,
                rank: await this.getUserRank(userId)
            };
        } catch (error) {
            console.error('❌ Error getting user progress:', error);
            return null;
        }
    }
}

// Create global gamification manager
window.gamificationManager = new GamificationManager();

console.log('✅ Gamification system loaded');
