// Dashboard Management System
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.activeSection = 'overview';
        
        console.log('📊 Dashboard Manager initialized');
    }

    // Initialize dashboard for logged-in user
    async initialize(user) {
        try {
            console.log('🚀 Initializing dashboard for:', user.displayName || user.email);
            
            this.currentUser = user;
            this.userProfile = await window.firebaseManager.getUserProfile(user.uid);
            
            if (!this.userProfile) {
                console.log('⚠️ No user profile found');
                return false;
            }
            
            // Update UI elements
            this.updateUserInfo();
            this.updateDashboardStats();
            this.loadRecentActivity();
            this.updateSubjectProgress();
            
            // Show dashboard
            document.getElementById('landing-page').style.display = 'none';
            document.getElementById('student-app').style.display = 'block';
            
            console.log('✅ Dashboard initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error initializing dashboard:', error);
            return false;
        }
    }

    // Update user information display
    updateUserInfo() {
        const nameElement = document.getElementById('user-name');
        const gradeBoardElement = document.getElementById('user-grade-board');
        const avatarElement = document.getElementById('user-avatar-img');
        
        if (nameElement) {
            nameElement.textContent = this.userProfile.name || 'Student';
        }
        
        if (gradeBoardElement) {
            gradeBoardElement.textContent = `Grade ${this.userProfile.grade || 'N/A'} • ${this.userProfile.board || 'N/A'}`;
        }
        
        if (avatarElement && this.userProfile.photoURL) {
            avatarElement.src = this.userProfile.photoURL;
        }
        
        console.log('👤 User info updated');
    }

    // Update dashboard statistics
    async updateDashboardStats() {
        try {
            const stats = this.userProfile.stats || {};
            const gamification = this.userProfile.gamification || {};
            
            // Update stat numbers with animation
            this.animateCounter('total-quizzes', stats.totalQuizzes || 0);
            this.animateCounter('average-score', Math.round(stats.averageScore || 0), '%');
            this.animateCounter('current-streak', stats.currentStreak || 0);
            this.animateCounter('total-points', gamification.totalPoints || 0);
            
            console.log('📈 Dashboard stats updated');
        } catch (error) {
            console.error('❌ Error updating dashboard stats:', error);
        }
    }

    // Animate counter with easing
    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = 0;
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
            
            element.textContent = currentValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Load recent quiz activity
    async loadRecentActivity() {
        try {
            console.log('📝 Loading recent activity...');
            
            const recentQuizzes = await window.firebaseManager.getUserQuizHistory(this.currentUser.uid, 5);
            const activityList = document.getElementById('activity-list');
            
            if (!activityList) return;
            
            if (recentQuizzes.length === 0) {
                activityList.innerHTML = `
                    <div class="activity-item empty-state">
                        <div class="activity-icon">📚</div>
                        <div class="activity-details">
                            <p>No quiz activity yet</p>
                            <span class="activity-time">Take your first quiz to see activity here</span>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Clear existing content
            activityList.innerHTML = '';
            
            recentQuizzes.forEach(quiz => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                const subjectIcons = {
                    mathematics: '🧮',
                    science: '🧪',
                    english: '📚',
                    social: '🌍'
                };
                
                const timeAgo = this.formatTimeAgo(quiz.timestamp?.toDate() || new Date());
                const scoreColor = quiz.score >= 80 ? '#10b981' : quiz.score >= 60 ? '#f59e0b' : '#ef4444';
                
                activityItem.innerHTML = `
                    <div class="activity-icon">${subjectIcons[quiz.subject] || '📝'}</div>
                    <div class="activity-details">
                        <p>${quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1)} Quiz</p>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                    <div class="activity-score" style="color: ${scoreColor}">
                        Score: ${quiz.score}%
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
            
            console.log('✅ Recent activity loaded');
        } catch (error) {
            console.error('❌ Error loading recent activity:', error);
        }
    }

    // Update subject progress bars
    updateSubjectProgress() {
        const stats = this.userProfile.stats || {};
        const subjectStats = stats.subjectStats || {};
        
        const subjects = ['mathematics', 'science', 'english', 'social'];
        const progressContainer = document.querySelector('.progress-list');
        
        if (!progressContainer) return;
        
        progressContainer.innerHTML = '';
        
        subjects.forEach(subject => {
            const subjectData = subjectStats[subject] || { averageScore: 0 };
            const score = Math.round(subjectData.averageScore || 0);
            
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            
            progressItem.innerHTML = `
                <span class="subject-name">${subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%; transition-delay: ${subjects.indexOf(subject) * 0.2}s"></div>
                </div>
                <span class="progress-percent">${score}%</span>
            `;
            
            progressContainer.appendChild(progressItem);
            
            // Animate progress bar after a short delay
            setTimeout(() => {
                const progressFill = progressItem.querySelector('.progress-fill');
                progressFill.style.width = `${score}%`;
            }, 500 + (subjects.indexOf(subject) * 200));
        });
        
        console.log('📊 Subject progress updated');
    }

    // Show specific dashboard section
    showSection(sectionName) {
        console.log('🔄 Switching to section:', sectionName);
        
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`dashboard-${sectionName}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        event?.target.classList.add('active');
        this.activeSection = sectionName;
        
        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    // Load section-specific data
    async loadSectionData(sectionName) {
        try {
            switch (sectionName) {
                case 'overview':
                    await this.updateDashboardStats();
                    await this.loadRecentActivity();
                    break;
                    
                case 'quizzes':
                    this.setupQuizCards();
                    break;
                    
                case 'progress':
                    await this.loadProgressAnalytics();
                    break;
                    
                case 'achievements':
                    await this.loadAchievements();
                    break;
                    
                case 'settings':
                    this.loadUserSettings();
                    break;
            }
        } catch (error) {
            console.error(`❌ Error loading section data for ${sectionName}:`, error);
        }
    }

    // Setup quiz cards interaction
    setupQuizCards() {
        const quizCards = document.querySelectorAll('.quiz-card');
        quizCards.forEach(card => {
            card.addEventListener('click', function() {
                const subject = this.onclick.toString().match(/startQuiz\('([^']+)'\)/)?.[1];
                if (subject) {
                    window.quizEngine.startQuiz(subject);
                }
            });
        });
    }

    // Load progress analytics
    async loadProgressAnalytics() {
        try {
            console.log('📈 Loading progress analytics...');
            
            // Get user's quiz history
            const quizHistory = await window.firebaseManager.getUserQuizHistory(this.currentUser.uid, 20);
            
            // Update performance chart (if canvas is available)
            this.updatePerformanceChart(quizHistory);
            
            // Update mastery levels
            this.updateMasteryLevels();
            
            console.log('✅ Progress analytics loaded');
        } catch (error) {
            console.error('❌ Error loading progress analytics:', error);
        }
    }

    // Update performance chart
    updatePerformanceChart(quizHistory) {
        const canvas = document.getElementById('performance-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (quizHistory.length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('No quiz data available', width / 2, height / 2);
            return;
        }
        
        // Prepare data (last 10 quizzes)
        const recentQuizzes = quizHistory.slice(0, 10).reverse();
        const scores = recentQuizzes.map(q => q.score);
        const maxScore = 100;
        const padding = 40;
        
        // Draw grid lines
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i * (height - 2 * padding)) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            // Y-axis labels
            ctx.fillStyle = '#64748b';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText((100 - i * 20).toString(), padding - 10, y + 4);
        }
        
        // Draw line chart
        if (scores.length > 1) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            scores.forEach((score, index) => {
                const x = padding + (index * (width - 2 * padding)) / (scores.length - 1);
                const y = padding + ((100 - score) * (height - 2 * padding)) / 100;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = '#667eea';
            scores.forEach((score, index) => {
                const x = padding + (index * (width - 2 * padding)) / (scores.length - 1);
                const y = padding + ((100 - score) * (height - 2 * padding)) / 100;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }

    // Update mastery levels
    updateMasteryLevels() {
        const stats = this.userProfile.stats || {};
        const subjectStats = stats.subjectStats || {};
        
        const masteryContainer = document.querySelector('.mastery-levels');
        if (!masteryContainer) return;
        
        masteryContainer.innerHTML = '';
        
        Object.entries(subjectStats).forEach(([subject, data]) => {
            const score = Math.round(data.averageScore || 0);
            let level = 'Beginner';
            
            if (score >= 90) level = 'Expert';
            else if (score >= 80) level = 'Advanced';
            else if (score >= 70) level = 'Intermediate';
            else if (score >= 60) level = 'Novice';
            
            const masteryItem = document.createElement('div');
            masteryItem.className = 'mastery-item';
            
            masteryItem.innerHTML = `
                <span class="subject">${subject.charAt(0).toUpperCase() + subject.slice(1)}</span>
                <div class="mastery-bar">
                    <div class="mastery-fill" style="width: ${score}%"></div>
                </div>
                <span class="mastery-level">${level}</span>
            `;
            
            masteryContainer.appendChild(masteryItem);
        });
    }

    // Load user achievements
    async loadAchievements() {
        try {
            console.log('🏆 Loading achievements...');
            
            const userAchievements = this.userProfile.achievements || [];
            const achievementsList = Object.values(window.gamificationManager.achievements);
            const achievementsGrid = document.getElementById('achievements-grid');
            
            if (!achievementsGrid) return;
            
            achievementsGrid.innerHTML = '';
            
            achievementsList.forEach(achievement => {
                const isEarned = userAchievements.find(a => a.id === achievement.id);
                
                const achievementBadge = document.createElement('div');
                achievementBadge.className = `achievement-badge ${isEarned ? 'earned' : ''}`;
                
                achievementBadge.innerHTML = `
                    <div class="badge-icon">${achievement.icon}</div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${isEarned ? '<span class="earned-date">Earned!</span>' : '<span class="not-earned">Not earned yet</span>'}
                `;
                
                achievementsGrid.appendChild(achievementBadge);
            });
            
            console.log('✅ Achievements loaded');
        } catch (error) {
            console.error('❌ Error loading achievements:', error);
        }
    }

    // Load user settings
    loadUserSettings() {
        const settingsSection = document.getElementById('dashboard-settings');
        if (!settingsSection) return;
        
        // Simple settings interface
        settingsSection.innerHTML = `
            <div class="settings-container">
                <div class="settings-group">
                    <h3>Profile Settings</h3>
                    <div class="setting-item">
                        <label>Display Name</label>
                        <input type="text" value="${this.userProfile.name || ''}" id="setting-name">
                    </div>
                    <div class="setting-item">
                        <label>Grade</label>
                        <select id="setting-grade">
                            <option value="6" ${this.userProfile.grade === 6 ? 'selected' : ''}>Class 6</option>
                            <option value="7" ${this.userProfile.grade === 7 ? 'selected' : ''}>Class 7</option>
                            <option value="8" ${this.userProfile.grade === 8 ? 'selected' : ''}>Class 8</option>
                            <option value="9" ${this.userProfile.grade === 9 ? 'selected' : ''}>Class 9</option>
                            <option value="10" ${this.userProfile.grade === 10 ? 'selected' : ''}>Class 10</option>
                            <option value="11" ${this.userProfile.grade === 11 ? 'selected' : ''}>Class 11</option>
                            <option value="12" ${this.userProfile.grade === 12 ? 'selected' : ''}>Class 12</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>Board</label>
                        <select id="setting-board">
                            <option value="CBSE" ${this.userProfile.board === 'CBSE' ? 'selected' : ''}>CBSE</option>
                            <option value="ICSE" ${this.userProfile.board === 'ICSE' ? 'selected' : ''}>ICSE</option>
                            <option value="State" ${this.userProfile.board === 'State' ? 'selected' : ''}>State Board</option>
                        </select>
                    </div>
                    <button class="btn-primary" onclick="dashboardManager.saveSettings()">Save Changes</button>
                </div>
                
                <div class="settings-group">
                    <h3>Preferences</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" ${this.userProfile.preferences?.notifications !== false ? 'checked' : ''} id="setting-notifications">
                            Enable notifications
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" ${this.userProfile.preferences?.emailUpdates !== false ? 'checked' : ''} id="setting-emails">
                            Email updates
                        </label>
                    </div>
                </div>
                
                <div class="settings-group danger-zone">
                    <h3>Account</h3>
                    <button class="btn-secondary" onclick="dashboardManager.exportData()">Export My Data</button>
                    <button class="btn-danger" onclick="dashboardManager.deleteAccount()">Delete Account</button>
                </div>
            </div>
        `;
    }

    // Save user settings
    async saveSettings() {
        try {
            const updatedProfile = {
                name: document.getElementById('setting-name').value,
                grade: parseInt(document.getElementById('setting-grade').value),
                board: document.getElementById('setting-board').value,
                preferences: {
                    notifications: document.getElementById('setting-notifications').checked,
                    emailUpdates: document.getElementById('setting-emails').checked
                }
            };
            
            await window.firebaseManager.saveUserProfile(this.currentUser.uid, updatedProfile);
            this.userProfile = { ...this.userProfile, ...updatedProfile };
            
            // Update display
            this.updateUserInfo();
            
            this.showNotification('Settings saved successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        }
    }

    // Refresh dashboard data
    async refreshDashboard() {
        try {
            console.log('🔄 Refreshing dashboard...');
            
            this.userProfile = await window.firebaseManager.getUserProfile(this.currentUser.uid);
            
            await this.updateDashboardStats();
            await this.loadRecentActivity();
            this.updateSubjectProgress();
            
            console.log('✅ Dashboard refreshed');
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
        }
    }

    // Utility function to format time ago
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 7) {
            return date.toLocaleDateString();
        } else if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        window.quizEngine.showNotification(message, type);
    }
}

// Global dashboard manager
window.dashboardManager = new DashboardManager();

// Global function to show dashboard sections
window.showDashboardSection = function(sectionName) {
    window.dashboardManager.showSection(sectionName);
};

console.log('✅ Dashboard Manager loaded');
