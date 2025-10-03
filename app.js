// Main Application Controller
class SmartEdTechApp {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        
        console.log('🚀 Smart EdTech-1 Application Starting...');
    }

    // Initialize the application
    async init() {
        try {
            console.log('⚡ Initializing application...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
                return;
            }
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Check Firebase availability
            if (typeof firebase === 'undefined' || !window.db || !window.auth) {
                throw new Error('Firebase services not available');
            }
            
            // Setup authentication state listener
            this.setupAuthStateListener();
            
            // Setup global event listeners
            this.setupEventListeners();
            
            // Setup demo quiz functionality
            this.setupDemoQuiz();
            
            // Hide loading screen after short delay
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showWelcomeNotification();
            }, 1500);
            
            this.isInitialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showErrorMessage('Failed to initialize application: ' + error.message);
        }
    }

    // Setup authentication state listener
    setupAuthStateListener() {
        window.auth.onAuthStateChanged(async (user) => {
            console.log('🔄 Auth state changed:', user ? `User: ${user.displayName || user.email}` : 'No user');
            
            this.currentUser = user;
            
            if (user) {
                // User is signed in
                await this.handleUserSignIn(user);
            } else {
                // User is signed out
                this.handleUserSignOut();
            }
        });
    }

    // Handle user sign in
    async handleUserSignIn(user) {
        try {
            console.log('👤 Handling user sign in...');
            
            // Update daily streak
            await window.gamificationManager.updateDailyStreak(user.uid);
            
            // Initialize dashboard
            const dashboardInitialized = await window.dashboardManager.initialize(user);
            
            if (dashboardInitialized) {
                console.log('✅ User dashboard initialized');
            } else {
                // No profile found - show onboarding
                console.log('⚠️ No user profile - showing onboarding');
                this.showOnboardingForm();
            }
            
        } catch (error) {
            console.error('❌ Error handling user sign in:', error);
            this.showNotification('Error loading user data', 'error');
        }
    }

    // Handle user sign out
    handleUserSignOut() {
        console.log('👋 Handling user sign out...');
        
        // Show landing page
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('student-app').style.display = 'none';
        
        // Reset navigation to login/signup
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            navAuth.innerHTML = `
                <button class="btn-login" onclick="showSignInModal()">Login</button>
                <button class="btn-signup" onclick="showOnboardingForm()">Sign Up</button>
            `;
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Navigation smooth scrolling
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.backgroundColor = 'rgba(102, 126, 234, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = '';
                header.style.backdropFilter = '';
            }
        });

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Animate stats on scroll
        this.setupScrollAnimations();
    }

    // Setup demo quiz functionality
    setupDemoQuiz() {
        // Make demo quiz functions globally available
        window.startDemoQuiz = (subject) => {
            console.log('🎮 Starting demo quiz for:', subject || 'random');
            
            const subjects = ['mathematics', 'science', 'english'];
            const selectedSubject = subject || subjects[Math.floor(Math.random() * subjects.length)];
            
            // Start quiz with 5 questions for demo
            window.quizEngine.startQuiz(selectedSubject, 'easy', 5);
        };

        window.showQuickQuiz = () => {
            const user = window.auth.currentUser;
            if (user) {
                // Show subject selection for logged-in users
                this.showQuickQuizModal();
            } else {
                // Start random demo quiz
                window.startDemoQuiz();
            }
        };
    }

    // Setup scroll animations
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate stat numbers
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateStatNumber(entry.target);
                        observer.unobserve(entry.target);
                    }
                    
                    // Animate feature cards
                    if (entry.target.classList.contains('feature-card') || 
                        entry.target.classList.contains('quiz-preview-card')) {
                        entry.target.style.animationPlayState = 'running';
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.3 });

        // Observe elements
        document.querySelectorAll('.stat-number, .feature-card, .quiz-preview-card').forEach(el => {
            observer.observe(el);
        });
    }

    // Animate stat numbers
    animateStatNumber(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/[^\d]/g, ''));
        const suffix = text.replace(/[\d]/g, '');
        
        let current = 0;
        const increment = number / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                element.textContent = number + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    }

    // Modal management functions
    showSignInModal() {
        this.createAuthModal('signin');
    }

    showOnboardingForm() {
        this.createAuthModal('signup');
    }

    showQuickQuizModal() {
        const modal = this.createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');

        title.textContent = 'Quick Quiz';
        text.innerHTML = `
            <p>Choose a subject for your quick quiz:</p>
            <div class="quiz-subject-grid">
                <button class="subject-btn" onclick="window.quizEngine.startQuiz('mathematics'); app.closeAllModals();">
                    <span class="subject-icon">🧮</span>
                    Mathematics
                </button>
                <button class="subject-btn" onclick="window.quizEngine.startQuiz('science'); app.closeAllModals();">
                    <span class="subject-icon">🧪</span>
                    Science
                </button>
                <button class="subject-btn" onclick="window.quizEngine.startQuiz('english'); app.closeAllModals();">
                    <span class="subject-icon">📚</span>
                    English
                </button>
                <button class="subject-btn" onclick="window.quizEngine.startQuiz('social'); app.closeAllModals();">
                    <span class="subject-icon">🌍</span>
                    Social Studies
                </button>
            </div>
        `;
        
        actions.innerHTML = `<button class="btn-secondary modal-btn" onclick="app.closeAllModals()">Cancel</button>`;
        this.showModal(modal);
    }

    // Create authentication modal
    createAuthModal(type) {
        const modal = this.createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');

        if (type === 'signin') {
            title.textContent = 'Welcome Back!';
            text.innerHTML = `
                <p>Sign in to continue your learning journey</p>
                <form id="signin-form" onsubmit="return false;">
                    <div class="form-group">
                        <label for="signin-email">Email Address</label>
                        <input type="email" id="signin-email" required placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="signin-password">Password</label>
                        <input type="password" id="signin-password" required placeholder="Enter your password">
                    </div>
                    <div class="form-actions">
                        <a href="#" onclick="app.showForgotPasswordModal()">Forgot Password?</a>
                    </div>
                </form>
            `;
            
            actions.innerHTML = `
                <button type="button" class="btn-primary modal-btn" onclick="app.submitSignIn()">Sign In</button>
                <button type="button" class="btn-secondary modal-btn" onclick="app.closeAllModals()">Cancel</button>
            `;
        } else {
            title.textContent = 'Join Smart EdTech-1';
            text.innerHTML = `
                <p>Create your account and start learning</p>
                <form id="signup-form" onsubmit="return false;">
                    <div class="form-group">
                        <label for="signup-name">Full Name</label>
                        <input type="text" id="signup-name" required placeholder="Enter your full name">
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email Address</label>
                        <input type="email" id="signup-email" required placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password</label>
                        <input type="password" id="signup-password" required placeholder="Create a password (min 6 characters)" minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="signup-grade">Current Grade</label>
                        <select id="signup-grade" required>
                            <option value="">Select Your Grade</option>
                            <option value="6">Class 6</option>
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="signup-board">Educational Board</label>
                        <select id="signup-board" required>
                            <option value="">Select Your Board</option>
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="State">State Board</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="signup-terms" required>
                            I agree to the Terms of Service and Privacy Policy
                        </label>
                    </div>
                </form>
            `;
            
            actions.innerHTML = `
                <button type="button" class="btn-primary modal-btn" onclick="app.submitSignUp()">Create Account</button>
                <button type="button" class="btn-secondary modal-btn" onclick="app.closeAllModals()">Cancel</button>
            `;
        }

        this.showModal(modal);
    }

    // Submit sign in
    async submitSignIn() {
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const submitBtn = document.querySelector('.modal-actions .btn-primary');
        this.setButtonLoading(submitBtn, true);

        try {
            await window.firebaseManager.signIn(email, password);
            this.closeAllModals();
            this.showNotification('Welcome back!', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Submit sign up
    async submitSignUp() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const grade = document.getElementById('signup-grade').value;
        const board = document.getElementById('signup-board').value;
        const terms = document.getElementById('signup-terms').checked;

        if (!name || !email || !password || !grade || !board) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!terms) {
            this.showNotification('Please accept the Terms of Service', 'error');
            return;
        }

        const submitBtn = document.querySelector('.modal-actions .btn-primary');
        this.setButtonLoading(submitBtn, true);

        try {
            // Create Firebase user
            const user = await window.firebaseManager.signUp(email, password, name);
            
            // Create user profile
            const profileData = {
                name,
                email,
                grade: parseInt(grade),
                board,
                preferences: { notifications: true, emailUpdates: true },
                stats: {
                    totalQuizzes: 0,
                    totalScore: 0,
                    averageScore: 0,
                    subjectStats: {}
                },
                gamification: { totalPoints: 0, currentLevel: 1 },
                achievements: [],
                createdAt: new Date()
            };
            
            await window.firebaseManager.saveUserProfile(user.uid, profileData);
            
            this.closeAllModals();
            this.showNotification(`Welcome to Smart EdTech-1, ${name}!`, 'success');
            
        } catch (error) {
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Utility functions
    createModal() {
        const existingModal = document.querySelector('.auth-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close" onclick="app.closeAllModals()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-text"></div>
                    <div class="modal-actions"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    showModal(modal) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
        document.body.style.overflow = 'auto';
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText;
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    showWelcomeNotification() {
        setTimeout(() => {
            this.showNotification('Welcome to Smart EdTech-1! 🚀 Start your learning journey today.', 'success');
        }, 500);
    }

    showNotification(message, type = 'info') {
        window.quizEngine.showNotification(message, type);
    }

    showErrorMessage(message) {
        console.error('💥 Application Error:', message);
        this.showNotification(message, 'error');
    }

    // Sign out function
    async signOut() {
        try {
            await window.firebaseManager.signOut();
            this.showNotification('Signed out successfully', 'success');
        } catch (error) {
            this.showNotification('Error signing out', 'error');
        }
    }
}

// Initialize application
const app = new SmartEdTechApp();

// Global functions
window.app = app;
window.showSignInModal = () => app.showSignInModal();
window.showOnboardingForm = () => app.showOnboardingForm();
window.signOutUser = () => app.signOut();
window.startQuiz = (subject) => window.quizEngine.startQuiz(subject);

// Start the application
app.init();

console.log('✅ Smart EdTech-1 Application Ready!');
