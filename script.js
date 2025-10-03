// ==================== FIREBASE INITIALIZATION ====================
// Your Firebase configuration is already loaded from HTML
console.log('🔥 Firebase App Name:', firebase.app().name);
console.log('🔥 Firebase services available:', {
    auth: !!firebase.auth,
    firestore: !!firebase.firestore
});

// ==================== WAIT FOR DOM AND INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('🚀 DOM loaded, initializing Smart EdTech-1...');
    
    // Check if Firebase is properly loaded
    if (typeof firebase === 'undefined' || !window.db || !window.auth) {
        console.error('❌ Firebase services not available!');
        showNotification('Firebase not loaded. Please refresh the page.', 'error');
        return;
    }
    
    console.log('✅ All services ready:', {
        firebase: !!firebase,
        auth: !!window.auth,
        db: !!window.db
    });

    // ==================== FIREBASE AUTH FUNCTIONS ====================
    
    function signUpUser(email, password, displayName) {
        console.log('📝 Creating account for:', email);
        return window.auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('✅ User created:', userCredential.user.uid);
                const user = userCredential.user;
                return user.updateProfile({
                    displayName: displayName
                }).then(() => user);
            })
            .then((user) => {
                console.log('✅ Profile updated for:', user.displayName);
                showNotification(`Welcome ${displayName}! Account created successfully.`, 'success');
                return user;
            })
            .catch((error) => {
                console.error('❌ Sign up error:', error.code, error.message);
                let friendlyMessage = 'Failed to create account. ';
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        friendlyMessage += 'Email already registered. Try signing in instead.';
                        break;
                    case 'auth/weak-password':
                        friendlyMessage += 'Password is too weak. Use at least 6 characters.';
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage += 'Please enter a valid email address.';
                        break;
                    default:
                        friendlyMessage += error.message;
                }
                showNotification(friendlyMessage, 'error');
                throw error;
            });
    }

    function signInUser(email, password) {
        console.log('🔑 Signing in user:', email);
        return window.auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('✅ User signed in:', userCredential.user.uid);
                const user = userCredential.user;
                showNotification(`Welcome back, ${user.displayName || 'Student'}!`, 'success');
                return user;
            })
            .catch((error) => {
                console.error('❌ Sign in error:', error.code, error.message);
                let friendlyMessage = 'Failed to sign in. ';
                switch(error.code) {
                    case 'auth/user-not-found':
                        friendlyMessage += 'No account found with this email.';
                        break;
                    case 'auth/wrong-password':
                        friendlyMessage += 'Incorrect password.';
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage += 'Please enter a valid email address.';
                        break;
                    case 'auth/too-many-requests':
                        friendlyMessage += 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        friendlyMessage += error.message;
                }
                showNotification(friendlyMessage, 'error');
                throw error;
            });
    }

    function signOutUser() {
        console.log('👋 Signing out user');
        return window.auth.signOut()
            .then(() => {
                console.log('✅ User signed out successfully');
                showNotification('Signed out successfully. See you soon!', 'success');
            })
            .catch((error) => {
                console.error('❌ Sign out error:', error);
                showNotification('Error signing out: ' + error.message, 'error');
            });
    }

    // ==================== FIRESTORE DATABASE FUNCTIONS ====================
    
    function saveStudentProfile(userId, profileData) {
        console.log('💾 Saving student profile for:', userId);
        const dataToSave = {
            ...profileData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: profileData.createdAt || firebase.firestore.FieldValue.serverTimestamp()
        };
        
        return window.db.collection('students').doc(userId).set(dataToSave, { merge: true })
            .then(() => {
                console.log('✅ Student profile saved successfully');
                showNotification('Profile saved successfully!', 'success');
                return true;
            })
            .catch((error) => {
                console.error('❌ Error saving profile:', error);
                showNotification('Error saving profile: ' + error.message, 'error');
                throw error;
            });
    }

    function getStudentProfile(userId) {
        console.log('📖 Fetching student profile for:', userId);
        return window.db.collection('students').doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    console.log('✅ Profile found:', doc.data());
                    return doc.data();
                } else {
                    console.log('ℹ️ No student profile found');
                    return null;
                }
            })
            .catch((error) => {
                console.error('❌ Error fetching profile:', error);
                return null;
            });
    }

    // ==================== NAVIGATION FUNCTIONALITY ====================
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header background opacity on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(102, 126, 234, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = '';
            header.style.backdropFilter = '';
        }
    });

    // ==================== FIXED MODAL SYSTEM ====================
    
    function createModal() {
        // Remove existing modal if any
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-text"></div>
                    <div class="modal-actions"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal on overlay click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close modal on close button click
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
        
        return modal;
    }

    function closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            
            // Wait for animation to complete before removing
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    function showSignInModal() {
        console.log('🔑 Showing sign in modal');
        const modal = createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');

        title.textContent = 'Welcome Back!';
        text.innerHTML = `
            <p style="text-align: center; margin-bottom: 2rem; color: #64748b;">Sign in to continue your learning journey</p>
            <form id="signin-form" onsubmit="return false;">
                <div class="form-group">
                    <label for="signin-email">Email Address</label>
                    <input type="email" id="signin-email" required placeholder="Enter your email" autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="signin-password">Password</label>
                    <input type="password" id="signin-password" required placeholder="Enter your password" autocomplete="current-password">
                </div>
                <div style="text-align: right; margin-top: 0.5rem;">
                    <a href="#" onclick="showForgotPasswordModal()" style="color: #667eea; text-decoration: none; font-size: 0.9rem;">Forgot Password?</a>
                </div>
            </form>
        `;
        
        actions.innerHTML = `
            <button type="button" class="btn-primary modal-btn" onclick="submitSignIn()">Sign In</button>
            <button type="button" class="btn-secondary modal-btn" onclick="closeModal()">Cancel</button>
        `;

        // Show modal with proper animation
        document.body.style.overflow = 'hidden';
        
        // Trigger animation after modal is added to DOM
        setTimeout(() => {
            modal.classList.add('show');
            // Focus on email input after animation
            setTimeout(() => {
                document.getElementById('signin-email')?.focus();
            }, 300);
        }, 10);
        
        // Handle Enter key submission
        setTimeout(() => {
            const form = document.getElementById('signin-form');
            form?.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    submitSignIn();
                }
            });
        }, 100);
    }

    function showOnboardingForm() {
        console.log('📝 Showing onboarding form');
        const modal = createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');

        title.textContent = 'Join Smart EdTech-1';
        text.innerHTML = `
            <p style="text-align: center; margin-bottom: 2rem; color: #64748b;">Create your account and start your personalized learning journey</p>
            <form id="onboarding-form" onsubmit="return false;">
                <div class="form-group">
                    <label for="student-name">Full Name</label>
                    <input type="text" id="student-name" required placeholder="Enter your full name" autocomplete="name">
                </div>
                <div class="form-group">
                    <label for="student-email">Email Address</label>
                    <input type="email" id="student-email" required placeholder="Enter your email" autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="student-password">Password</label>
                    <input type="password" id="student-password" required placeholder="Create a password (min 6 characters)" minlength="6" autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="student-grade">Current Grade</label>
                    <select id="student-grade" required>
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
                    <label for="student-board">Educational Board</label>
                    <select id="student-board" required>
                        <option value="">Select Your Board</option>
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State">State Board</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="terms-agreement" required>
                        I agree to the <a href="#" style="color: #667eea;">Terms of Service</a> and <a href="#" style="color: #667eea;">Privacy Policy</a>
                    </label>
                </div>
            </form>
        `;
        
        actions.innerHTML = `
            <button type="button" class="btn-primary modal-btn" onclick="submitOnboarding()">Create Account</button>
            <button type="button" class="btn-secondary modal-btn" onclick="closeModal()">Cancel</button>
        `;

        // Show modal with proper animation
        document.body.style.overflow = 'hidden';
        
        // Trigger animation after modal is added to DOM
        setTimeout(() => {
            modal.classList.add('show');
            // Focus on name input after animation
            setTimeout(() => {
                document.getElementById('student-name')?.focus();
            }, 300);
        }, 10);
        
        // Handle Enter key submission
        setTimeout(() => {
            const form = document.getElementById('onboarding-form');
            form?.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    submitOnboarding();
                }
            });
        }, 100);
    }

    function showModal(type, data = {}) {
        const modal = createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');

        switch (type) {
            case 'demo':
                title.textContent = 'Platform Demo';
                text.innerHTML = `
                    <p>See how our AI-powered platform adapts to different learning styles!</p>
                    <div style="text-align: center; margin: 2rem 0;">
                        <div style="width: 100%; height: 200px; background: #f1f5f9; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: #64748b;">🎥 Demo Video Player</span>
                        </div>
                    </div>
                `;
                actions.innerHTML = `
                    <button class="btn-primary modal-btn" onclick="playDemoVideo()">Play Video</button>
                    <button class="btn-secondary modal-btn" onclick="closeModal()">Close</button>
                `;
                break;
                
            case 'trial':
                title.textContent = 'Start Free Trial';
                text.innerHTML = `
                    <p>Get 7 days of unlimited access to all premium features!</p>
                    <ul style="text-align: left; margin: 1rem 0;">
                        <li>✅ Personalized learning paths</li>
                        <li>✅ Unlimited video lessons</li>
                        <li>✅ Progress tracking & analytics</li>
                        <li>✅ AI-powered recommendations</li>
                    </ul>
                `;
                actions.innerHTML = `
                    <button class="btn-primary modal-btn" onclick="startTrialProcess()">Start Free Trial</button>
                    <button class="btn-secondary modal-btn" onclick="closeModal()">Maybe Later</button>
                `;
                break;
                
            case 'feature':
                title.textContent = data.title || 'Feature Details';
                text.innerHTML = `<p>${data.content || 'Feature information coming soon!'}</p>`;
                actions.innerHTML = `
                    <button class="btn-primary modal-btn" onclick="closeModal()">Got it!</button>
                `;
                break;
        }

        // Show modal with proper animation
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    // ==================== FORM SUBMISSION HANDLERS ====================
    
    function submitSignIn() {
        const email = document.getElementById('signin-email')?.value.trim();
        const password = document.getElementById('signin-password')?.value;

        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        console.log('🔑 Attempting sign in for:', email);
        
        // Show loading state
        const submitBtn = document.querySelector('.modal-actions .btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        signInUser(email, password)
            .then((user) => {
                console.log('✅ Sign in successful for:', user.uid);
                closeModal();
                // Load user profile
                return getStudentProfile(user.uid);
            })
            .then((profile) => {
                if (profile) {
                    console.log('✅ Profile loaded:', profile);
                    showNotification(`Welcome back! Last activity: ${profile.lastUpdated ? new Date(profile.lastUpdated.toDate()).toLocaleDateString() : 'Recently'}`, 'success');
                }
            })
            .catch((error) => {
                console.error('❌ Sign in failed:', error);
            })
            .finally(() => {
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
    }

    function submitOnboarding() {
        const name = document.getElementById('student-name')?.value.trim();
        const email = document.getElementById('student-email')?.value.trim();
        const password = document.getElementById('student-password')?.value;
        const grade = document.getElementById('student-grade')?.value;
        const board = document.getElementById('student-board')?.value;
        const termsAccepted = document.getElementById('terms-agreement')?.checked;

        // Validate all fields
        if (!name || !email || !password || !grade || !board) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!termsAccepted) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        console.log('📝 Starting onboarding process for:', email);
        
        // Show loading state
        const submitBtn = document.querySelector('.modal-actions .btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const studentData = {
            name: name,
            email: email,
            grade: parseInt(grade),
            board: board,
            preferences: {
                notifications: true,
                emailUpdates: true
            },
            progress: {
                completedLessons: 0,
                totalLessons: 0,
                currentStreak: 0,
                totalTimeSpent: 0,
                averageScore: 0,
                achievements: []
            },
            subjects: [],
            createdAt: new Date(),
            isActive: true
        };

        // Create Firebase account
        signUpUser(email, password, name)
            .then((user) => {
                console.log('✅ Firebase user created:', user.uid);
                // Save student profile to Firestore
                return saveStudentProfile(user.uid, studentData);
            })
            .then(() => {
                console.log('✅ Student profile saved');
                closeModal();
                showWelcomeDashboard(studentData);
            })
            .catch((error) => {
                console.error('❌ Onboarding failed:', error);
            })
            .finally(() => {
                // Reset button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
    }

    function showWelcomeDashboard(studentData) {
        showNotification(`🎉 Welcome to Smart EdTech-1, ${studentData.name}! Your personalized learning journey starts now.`, 'success');
        
        // Simulate initial assessment prompt
        setTimeout(() => {
            showNotification('Ready for your initial assessment? This helps us personalize your learning path.', 'info');
        }, 3000);
        
        // Navigate to dashboard section
        setTimeout(() => {
            const dashboardSection = document.getElementById('dashboard') || document.querySelector('.dashboard-preview');
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 5000);
    }

    // ==================== ENHANCED NOTIFICATION SYSTEM ====================
    
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => {
            n.classList.remove('show');
            setTimeout(() => n.remove(), 400);
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            'success': '🎉',
            'error': '❌',
            'info': '💡',
            'warning': '⚠️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || '💡'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove after 6 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 6000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        });
    }

    // ==================== AUTHENTICATION STATE MANAGEMENT ====================
    
    // Listen for authentication state changes
    window.auth.onAuthStateChanged((user) => {
        console.log('🔄 Auth state changed:', user ? `User: ${user.displayName || user.email}` : 'No user');
        
        if (user) {
            updateUIForSignedInUser(user);
            // Load user profile
            getStudentProfile(user.uid).then(profile => {
                if (profile) {
                    console.log('📊 User profile loaded:', profile);
                    updateDashboardWithUserData(profile);
                }
            });
        } else {
            updateUIForSignedOutUser();
        }
    });

    function updateUIForSignedInUser(user) {
        // Update navigation
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            navAuth.innerHTML = `
                <span style="color: white; margin-right: 1rem; font-weight: 500;">
                    👋 ${user.displayName ? user.displayName.split(' ')[0] : 'Student'}
                </span>
                <button class="btn-login" onclick="showUserMenu()" style="margin-right: 0.5rem;">Menu</button>
                <button class="btn-signup" onclick="signOutUser()">Sign Out</button>
            `;
        }
        
        // Update hero buttons
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            heroButtons.innerHTML = `
                <button class="btn-primary" onclick="goToDashboard()">Continue Learning</button>
                <button class="btn-secondary" onclick="showModal('demo')">Watch Demo</button>
            `;
        }

        // Update CTA buttons
        const ctaButtons = document.querySelector('.cta-buttons');
        if (ctaButtons) {
            ctaButtons.innerHTML = `
                <button class="btn-primary-large" onclick="goToDashboard()">Go to Dashboard</button>
                <button class="btn-secondary-large" onclick="showModal('demo')">Watch Demo</button>
            `;
        }
    }

    function updateUIForSignedOutUser() {
        // Reset navigation
        const navAuth = document.querySelector('.nav-auth');
        if (navAuth) {
            navAuth.innerHTML = `
                <button class="btn-login" onclick="showSignInModal()">Login</button>
                <button class="btn-signup" onclick="showOnboardingForm()">Sign Up</button>
            `;
        }
        
        // Reset hero buttons
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            heroButtons.innerHTML = `
                <button class="btn-primary" onclick="showOnboardingForm()">Start Learning</button>
                <button class="btn-secondary" onclick="showModal('demo')">Watch Demo</button>
            `;
        }

        // Reset CTA buttons
        const ctaButtons = document.querySelector('.cta-buttons');
        if (ctaButtons) {
            ctaButtons.innerHTML = `
                <button class="btn-primary-large" onclick="showOnboardingForm()">Start Free Trial</button>
                <button class="btn-secondary-large" onclick="showModal('demo')">Schedule Demo</button>
            `;
        }
    }

    function updateDashboardWithUserData(profile) {
        // Update progress bars with actual data
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const percentage = profile.progress?.averageScore || 75;
            bar.style.width = percentage + '%';
        });

        // Update metrics with real data
        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length >= 3) {
            metrics[0].textContent = (profile.progress?.averageScore || 85) + '%';
            metrics[1].textContent = ((profile.progress?.totalTimeSpent || 150) / 60).toFixed(1) + ' hrs/day';
            metrics[2].textContent = (profile.progress?.completedLessons || 23) + '/' + (profile.progress?.totalLessons || 25);
        }
    }

    // ==================== INTERACTIVE FEATURES ====================
    
    // Animated counters for hero stats
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                if (target >= 1000) {
                    element.textContent = Math.floor(start / 1000) + 'K+';
                } else {
                    element.textContent = Math.floor(start) + (target > 50 ? '+' : '%');
                }
                requestAnimationFrame(updateCounter);
            } else {
                if (target >= 1000) {
                    element.textContent = Math.floor(target / 1000) + 'K+';
                } else {
                    element.textContent = target + (target > 50 ? '+' : '%');
                }
            }
        }
        updateCounter();
    }

    // Trigger animations when elements come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stat-number')) {
                    const text = entry.target.textContent;
                    const number = parseInt(text.replace(/[^\d]/g, ''));
                    animateCounter(entry.target, number);
                    observer.unobserve(entry.target);
                }
                
                if (entry.target.classList.contains('progress-fill')) {
                    const targetWidth = parseInt(entry.target.style.width) || 75;
                    entry.target.style.width = '0%';
                    setTimeout(() => {
                        entry.target.style.width = targetWidth + '%';
                    }, 500);
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.3 });

    // Observe elements for animations
    document.querySelectorAll('.stat-number, .progress-fill').forEach(el => observer.observe(el));

    // Board selection functionality
    const boardCards = document.querySelectorAll('.board-card');
    boardCards.forEach(card => {
        card.addEventListener('click', function() {
            boardCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const boardType = this.querySelector('h3').textContent;
            showNotification(`${boardType} curriculum selected! 📚`, 'success');
        });
    });

    // Feature cards interaction
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const featureTitle = this.querySelector('h3').textContent;
            const featureDetails = {
                'Personalized Syllabus': 'Our AI analyzes your learning patterns, strengths, and areas for improvement to create a custom curriculum that adapts in real-time to your progress.',
                'Animated Video Lessons': 'Interactive 3D animations and real-world examples make complex concepts easy to understand and remember.',
                'Adaptive Assessments': 'Smart quizzes that adjust difficulty based on your performance, ensuring optimal learning challenge without frustration.',
                'Progress Tracking': 'Comprehensive analytics show your learning journey with detailed insights, streaks, and personalized recommendations.',
                'Offline Access': 'Download lessons, videos, and exercises to continue learning even without internet connectivity.',
                'AI Learning Assistant': 'Get instant help, explanations, and personalized study recommendations from our intelligent tutoring system.',
                'Gamified Learning': 'Earn points, unlock achievements, and compete with friends to make learning engaging and motivating.',
                'Multilingual Support': 'Learn in your preferred language with support for Hindi, English, and regional languages.'
            };
            
            showModal('feature', {
                title: featureTitle,
                content: featureDetails[featureTitle] || 'This feature helps enhance your learning experience!'
            });
        });
    });

    // Learning flow steps interaction
    const flowSteps = document.querySelectorAll('.flow-step');
    flowSteps.forEach((step, index) => {
        step.addEventListener('click', function() {
            flowSteps.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            
            const stepDetails = [
                'Select your educational board, grade level, and preferred subjects to customize your learning experience.',
                'Take a comprehensive assessment to measure your current knowledge and identify your learning style.',
                'Our AI creates a personalized learning path with customized pace, difficulty, and content preferences.',
                'Engage with interactive lessons, videos, simulations, and hands-on exercises designed for your level.',
                'Monitor your progress with detailed analytics, celebrate achievements, and get AI-powered study recommendations.'
            ];
            
            showNotification(`Step ${index + 1}: ${stepDetails[index]}`, 'info');
        });
    });

    // ==================== GLOBAL FUNCTIONS ====================
    
    // Make functions globally available
    window.showSignInModal = showSignInModal;
    window.showOnboardingForm = showOnboardingForm;
    window.closeModal = closeModal;
    window.submitSignIn = submitSignIn;
    window.submitOnboarding = submitOnboarding;
    window.signOutUser = signOutUser;
    window.showNotification = showNotification;
    window.showModal = showModal;
    
    // Additional global functions
    window.goToDashboard = function() {
        const user = window.auth.currentUser;
        if (user) {
            showNotification('Loading your personalized dashboard...', 'info');
            const dashboardSection = document.querySelector('.dashboard-preview');
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            showNotification('Please sign in to access your dashboard', 'warning');
            showSignInModal();
        }
    };

    window.playDemoVideo = function() {
        showNotification('Demo video loading... 🎬', 'info');
        closeModal();
        // Here you would integrate with your video player
    };

    window.startTrialProcess = function() {
        const user = window.auth.currentUser;
        if (user) {
            showNotification('Free trial activated! 🎉', 'success');
            closeModal();
        } else {
            closeModal();
            showNotification('Please create an account to start your free trial', 'info');
            setTimeout(showOnboardingForm, 1000);
        }
    };

    window.showUserMenu = function() {
        const user = window.auth.currentUser;
        if (user) {
            showModal('feature', {
                title: 'User Menu',
                content: `
                    <div style="text-align: left;">
                        <p><strong>Account:</strong> ${user.displayName || 'Student'}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <hr style="margin: 1rem 0;">
                        <button class="btn-primary" onclick="goToDashboard(); closeModal();" style="width: 100%; margin-bottom: 0.5rem;">Go to Dashboard</button>
                        <button class="btn-secondary" onclick="showNotification('Profile settings coming soon!', 'info'); closeModal();" style="width: 100%; margin-bottom: 0.5rem;">Edit Profile</button>
                        <button class="btn-secondary" onclick="signOutUser(); closeModal();" style="width: 100%;">Sign Out</button>
                    </div>
                `
            });
        }
    };

    window.showForgotPasswordModal = function() {
        const modal = createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');

        title.textContent = 'Reset Password';
        text.innerHTML = `
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            <div class="form-group">
                <label for="reset-email">Email Address</label>
                <input type="email" id="reset-email" required placeholder="Enter your email">
            </div>
        `;
        
        actions.innerHTML = `
            <button class="btn-primary modal-btn" onclick="sendPasswordReset()">Send Reset Link</button>
            <button class="btn-secondary modal-btn" onclick="showSignInModal()">Back to Sign In</button>
        `;

        // Show modal with proper animation
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    };

    window.sendPasswordReset = function() {
        const email = document.getElementById('reset-email')?.value.trim();
        if (!email) {
            showNotification('Please enter your email address', 'error');
            return;
        }

        window.auth.sendPasswordResetEmail(email)
            .then(() => {
                showNotification('Password reset email sent! Check your inbox.', 'success');
                closeModal();
            })
            .catch((error) => {
                console.error('Password reset error:', error);
                showNotification('Error: ' + error.message, 'error');
            });
    };

    // ==================== INITIALIZATION COMPLETE ====================
    
    console.log('🎓 Smart EdTech-1 fully initialized!');
    console.log('🔥 Firebase Auth ready:', !!window.auth);
    console.log('🗄️ Firestore ready:', !!window.db);
    
    // Welcome message
    setTimeout(() => {
        showNotification('Welcome to Smart EdTech-1! 🚀 Your personalized learning journey awaits.', 'success');
    }, 1000);

    // Check if user is already signed in
    const currentUser = window.auth.currentUser;
    if (currentUser) {
        console.log('👤 User already signed in:', currentUser.displayName || currentUser.email);
        updateUIForSignedInUser(currentUser);
    }
});
