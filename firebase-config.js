// Firebase Configuration and Initialization
console.log('🔥 Initializing Firebase...');

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWXOvYpY-PwmOWlGXe8fsTTiQLGcJpgTQ",
    authDomain: "studio-4266064708-a46a7.firebaseapp.com",
    projectId: "studio-4266064708-a46a7",
    storageBucket: "studio-4266064708-a46a7.firebasestorage.app",
    messagingSenderId: "988323612405",
    appId: "1:988323612405:web:9a536479a446b6268667bc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make Firebase services available globally
window.db = firebase.firestore();
window.auth = firebase.auth();

// Enhanced Firebase Helper Functions
class FirebaseManager {
    constructor() {
        this.db = window.db;
        this.auth = window.auth;
    }

    // Authentication Methods
    async signUp(email, password, displayName) {
        try {
            console.log('🔐 Creating account for:', email);
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            await user.updateProfile({ displayName });
            console.log('✅ Account created successfully');
            
            return user;
        } catch (error) {
            console.error('❌ Sign up error:', error);
            throw this.handleAuthError(error);
        }
    }

    async signIn(email, password) {
        try {
            console.log('🔑 Signing in:', email);
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Sign in successful');
            return userCredential.user;
        } catch (error) {
            console.error('❌ Sign in error:', error);
            throw this.handleAuthError(error);
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            console.log('✅ Sign out successful');
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            console.log('✅ Password reset email sent');
        } catch (error) {
            console.error('❌ Password reset error:', error);
            throw this.handleAuthError(error);
        }
    }

    // Firestore Methods
    async saveUserProfile(userId, profileData) {
        try {
            console.log('💾 Saving user profile:', userId);
            const dataToSave = {
                ...profileData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: profileData.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await this.db.collection('students').doc(userId).set(dataToSave, { merge: true });
            console.log('✅ Profile saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving profile:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            console.log('📖 Fetching user profile:', userId);
            const doc = await this.db.collection('students').doc(userId).get();
            
            if (doc.exists) {
                console.log('✅ Profile found');
                return doc.data();
            } else {
                console.log('ℹ️ No profile found');
                return null;
            }
        } catch (error) {
            console.error('❌ Error fetching profile:', error);
            return null;
        }
    }

    async saveQuizResult(userId, quizResult) {
        try {
            console.log('💾 Saving quiz result:', userId);
            
            // Save individual quiz result
            await this.db.collection('quiz_results').add({
                userId,
                ...quizResult,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update user stats
            const userRef = this.db.collection('students').doc(userId);
            await this.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data();
                
                const currentStats = userData.stats || {
                    totalQuizzes: 0,
                    totalScore: 0,
                    totalTimeSpent: 0,
                    subjectStats: {}
                };
                
                // Update overall stats
                currentStats.totalQuizzes += 1;
                currentStats.totalScore += quizResult.score;
                currentStats.totalTimeSpent += quizResult.timeSpent || 0;
                
                // Update subject-specific stats
                const subject = quizResult.subject;
                if (!currentStats.subjectStats[subject]) {
                    currentStats.subjectStats[subject] = {
                        quizzesTaken: 0,
                        totalScore: 0,
                        averageScore: 0
                    };
                }
                
                currentStats.subjectStats[subject].quizzesTaken += 1;
                currentStats.subjectStats[subject].totalScore += quizResult.score;
                currentStats.subjectStats[subject].averageScore = 
                    currentStats.subjectStats[subject].totalScore / currentStats.subjectStats[subject].quizzesTaken;
                
                // Calculate overall average
                currentStats.averageScore = currentStats.totalScore / currentStats.totalQuizzes;
                
                transaction.update(userRef, { stats: currentStats });
            });
            
            console.log('✅ Quiz result saved and stats updated');
            return true;
        } catch (error) {
            console.error('❌ Error saving quiz result:', error);
            throw error;
        }
    }

    async getUserQuizHistory(userId, limit = 10) {
        try {
            console.log('📊 Fetching quiz history for:', userId);
            const query = await this.db.collection('quiz_results')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            const history = [];
            query.forEach(doc => {
                history.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Quiz history fetched:', history.length, 'items');
            return history;
        } catch (error) {
            console.error('❌ Error fetching quiz history:', error);
            return [];
        }
    }

    async updateUserAchievements(userId, newAchievement) {
        try {
            const userRef = this.db.collection('students').doc(userId);
            await this.db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                const userData = userDoc.data();
                
                const achievements = userData.achievements || [];
                if (!achievements.find(a => a.id === newAchievement.id)) {
                    achievements.push({
                        ...newAchievement,
                        unlockedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    transaction.update(userRef, { achievements });
                    console.log('🏆 Achievement unlocked:', newAchievement.name);
                }
            });
        } catch (error) {
            console.error('❌ Error updating achievements:', error);
        }
    }

    // Error Handling
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'Email already registered. Try signing in instead.',
            'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/operation-not-allowed': 'Operation not allowed. Please contact support.'
        };
        
        return {
            code: error.code,
            message: errorMessages[error.code] || error.message
        };
    }

    // Real-time listeners
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }

    onUserProfileChanged(userId, callback) {
        return this.db.collection('students').doc(userId).onSnapshot(callback);
    }
}

// Create global Firebase manager instance
window.firebaseManager = new FirebaseManager();

console.log('✅ Firebase configuration loaded successfully');
