// Enhanced Quiz Engine
class QuizEngine {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.timeLimit = 300; // 5 minutes default
        this.timer = null;
        this.score = 0;
        this.difficulty = 'easy';
        this.subject = '';
        
        console.log('🎯 Quiz Engine initialized');
    }

    // Start a new quiz
    startQuiz(subject, difficulty = 'easy', questionCount = 10) {
        try {
            console.log(`🚀 Starting ${subject} quiz - ${difficulty} level`);
            
            this.subject = subject;
            this.difficulty = difficulty;
            this.currentQuestionIndex = 0;
            this.userAnswers = [];
            this.score = 0;
            this.startTime = new Date();
            
            // Get questions for the subject
            const allQuestions = window.QuizQuestions[subject] || [];
            if (allQuestions.length === 0) {
                throw new Error(`No questions found for subject: ${subject}`);
            }
            
            // Filter by difficulty and shuffle
            let filteredQuestions = allQuestions.filter(q => 
                difficulty === 'easy' ? true : q.difficulty === difficulty
            );
            
            if (filteredQuestions.length === 0) {
                filteredQuestions = allQuestions; // Fallback to all questions
            }
            
            // Shuffle and select questions
            this.currentQuiz = this.shuffleArray(filteredQuestions).slice(0, questionCount);
            
            console.log(`✅ Quiz prepared: ${this.currentQuiz.length} questions`);
            
            // Show quiz modal
            this.showQuizModal();
            this.loadQuestion();
            this.startTimer();
            
            return true;
        } catch (error) {
            console.error('❌ Error starting quiz:', error);
            this.showNotification('Error starting quiz: ' + error.message, 'error');
            return false;
        }
    }

    // Load current question
    loadQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.currentQuiz.length) {
            return this.endQuiz();
        }
        
        const question = this.currentQuiz[this.currentQuestionIndex];
        const questionContainer = document.getElementById('question-text');
        const optionsContainer = document.getElementById('question-options');
        const questionCounter = document.getElementById('question-counter');
        const progressBar = document.getElementById('quiz-progress-bar');
        
        // Update question text
        questionContainer.textContent = question.question;
        
        // Update progress
        questionCounter.textContent = `${this.currentQuestionIndex + 1} / ${this.currentQuiz.length}`;
        const progressPercent = ((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Clear and populate options
        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.onclick = () => this.selectOption(index);
            optionsContainer.appendChild(button);
        });
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        console.log(`📝 Loaded question ${this.currentQuestionIndex + 1}: ${question.question}`);
    }

    // Handle option selection
    selectOption(optionIndex) {
        // Remove previous selections
        document.querySelectorAll('.option-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Mark current selection
        const selectedButton = document.querySelectorAll('.option-button')[optionIndex];
        selectedButton.classList.add('selected');
        
        // Store answer
        this.userAnswers[this.currentQuestionIndex] = {
            questionId: this.currentQuiz[this.currentQuestionIndex].id,
            selectedOption: optionIndex,
            isCorrect: optionIndex === this.currentQuiz[this.currentQuestionIndex].correct,
            timeSpent: new Date() - this.startTime
        };
        
        // Enable next button
        document.getElementById('next-btn').disabled = false;
        if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
            document.getElementById('submit-btn').style.display = 'inline-block';
        }
        
        console.log(`✏️ Option ${optionIndex} selected for question ${this.currentQuestionIndex + 1}`);
    }

    // Navigate to next question
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
        }
    }

    // Navigate to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
            
            // Restore previous answer if exists
            const previousAnswer = this.userAnswers[this.currentQuestionIndex];
            if (previousAnswer) {
                const buttons = document.querySelectorAll('.option-button');
                buttons[previousAnswer.selectedOption]?.classList.add('selected');
                document.getElementById('next-btn').disabled = false;
            }
        }
    }

    // Update navigation button states
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        nextBtn.disabled = !this.userAnswers[this.currentQuestionIndex];
        
        if (this.currentQuestionIndex === this.currentQuiz.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }

    // Start quiz timer
    startTimer() {
        const timerDisplay = document.getElementById('time-remaining');
        let timeLeft = this.timeLimit;
        
        this.timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                this.endQuiz();
            }
        }, 1000);
    }

    // End quiz and show results
    async endQuiz() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        const endTime = new Date();
        const totalTime = Math.floor((endTime - this.startTime) / 1000);
        
        // Calculate score
        const correctAnswers = this.userAnswers.filter(answer => answer && answer.isCorrect).length;
        const totalQuestions = this.currentQuiz.length;
        this.score = Math.round((correctAnswers / totalQuestions) * 100);
        
        console.log(`🏁 Quiz completed: ${correctAnswers}/${totalQuestions} correct (${this.score}%)`);
        
        // Save results to Firebase if user is logged in
        const user = window.auth.currentUser;
        if (user) {
            const quizResult = {
                subject: this.subject,
                difficulty: this.difficulty,
                score: this.score,
                correctAnswers,
                totalQuestions,
                timeSpent: totalTime,
                answers: this.userAnswers.map(answer => ({
                    questionId: answer?.questionId,
                    selectedOption: answer?.selectedOption,
                    isCorrect: answer?.isCorrect
                }))
            };
            
            try {
                await window.firebaseManager.saveQuizResult(user.uid, quizResult);
                
                // Check for achievements
                window.gamificationManager.checkAchievements(user.uid, quizResult);
                
                // Update dashboard if visible
                if (window.dashboardManager && document.getElementById('student-app').style.display !== 'none') {
                    window.dashboardManager.refreshDashboard();
                }
            } catch (error) {
                console.error('❌ Error saving quiz result:', error);
            }
        }
        
        // Show results modal
        this.showResultsModal(correctAnswers, totalQuestions, totalTime);
    }

    // Show quiz results
    showResultsModal(correct, total, timeSpent) {
        const modal = this.createModal();
        const title = modal.querySelector('.modal-title');
        const text = modal.querySelector('.modal-text');
        const actions = modal.querySelector('.modal-actions');
        
        // Performance message
        let performanceMessage = '';
        let performanceClass = '';
        
        if (this.score >= 90) {
            performanceMessage = 'Excellent! Outstanding performance! 🌟';
            performanceClass = 'excellent';
        } else if (this.score >= 80) {
            performanceMessage = 'Great job! You\'re doing very well! 🎉';
            performanceClass = 'great';
        } else if (this.score >= 70) {
            performanceMessage = 'Good work! Keep practicing to improve! 👍';
            performanceClass = 'good';
        } else if (this.score >= 60) {
            performanceMessage = 'Fair attempt. Focus on areas that need improvement. 📚';
            performanceClass = 'fair';
        } else {
            performanceMessage = 'Keep practicing! Every attempt makes you better! 💪';
            performanceClass = 'needs-improvement';
        }
        
        title.textContent = 'Quiz Results';
        text.innerHTML = `
            <div class="quiz-results ${performanceClass}">
                <div class="result-score">
                    <span class="score-big">${this.score}%</span>
                    <p class="performance-msg">${performanceMessage}</p>
                </div>
                
                <div class="result-details">
                    <div class="result-stat">
                        <span class="stat-label">Correct Answers:</span>
                        <span class="stat-value">${correct} / ${total}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Time Taken:</span>
                        <span class="stat-value">${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Subject:</span>
                        <span class="stat-value">${this.subject.charAt(0).toUpperCase() + this.subject.slice(1)}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Difficulty:</span>
                        <span class="stat-value">${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}</span>
                    </div>
                </div>
                
                <div class="result-recommendations">
                    <h4>📈 Recommendations:</h4>
                    ${this.getRecommendations()}
                </div>
            </div>
        `;
        
        actions.innerHTML = `
            <button class="btn-primary modal-btn" onclick="quizEngine.reviewAnswers()">Review Answers</button>
            <button class="btn-secondary modal-btn" onclick="quizEngine.takeAnotherQuiz()">Take Another Quiz</button>
            <button class="btn-secondary modal-btn" onclick="quizEngine.closeQuiz()">Close</button>
        `;
        
        this.showModal(modal);
    }

    // Get personalized recommendations
    getRecommendations() {
        const recommendations = [];
        
        if (this.score < 70) {
            recommendations.push('📚 Review the basic concepts in this subject');
            recommendations.push('🔄 Retake this quiz after studying');
        }
        
        if (this.score >= 80 && this.difficulty === 'easy') {
            recommendations.push('🎯 Try the medium difficulty level');
        }
        
        if (this.score >= 85 && this.difficulty === 'medium') {
            recommendations.push('🔥 Challenge yourself with hard difficulty');
        }
        
        // Subject-specific recommendations
        const wrongTopics = this.getWeakTopics();
        if (wrongTopics.length > 0) {
            recommendations.push(`📖 Focus on: ${wrongTopics.join(', ')}`);
        }
        
        return recommendations.map(rec => `<p>${rec}</p>`).join('');
    }

    // Identify weak topics
    getWeakTopics() {
        const topicStats = {};
        
        this.userAnswers.forEach((answer, index) => {
            if (answer) {
                const question = this.currentQuiz[index];
                const topic = question.topic;
                
                if (!topicStats[topic]) {
                    topicStats[topic] = { correct: 0, total: 0 };
                }
                
                topicStats[topic].total++;
                if (answer.isCorrect) {
                    topicStats[topic].correct++;
                }
            }
        });
        
        return Object.keys(topicStats).filter(topic => 
            topicStats[topic].correct / topicStats[topic].total < 0.7
        );
    }

    // Review answers functionality
    reviewAnswers() {
        this.closeQuiz();
        // Implement detailed answer review
        console.log('📖 Review answers feature - TODO: Implement detailed review');
        this.showNotification('Answer review feature coming soon!', 'info');
    }

    // Take another quiz
    takeAnotherQuiz() {
        this.closeQuiz();
        
        // If user is logged in, show quiz selection
        if (window.auth.currentUser) {
            window.showDashboardSection('quizzes');
        } else {
            // Show quiz demo options
            const demoSubjects = ['mathematics', 'science', 'english'];
            const randomSubject = demoSubjects[Math.floor(Math.random() * demoSubjects.length)];
            setTimeout(() => this.startQuiz(randomSubject), 500);
        }
    }

    // Utility functions
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Modal management
    showQuizModal() {
        const modal = document.getElementById('quiz-modal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    createModal() {
        const existingModal = document.querySelector('.results-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay results-modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close" onclick="quizEngine.closeModal()">&times;</button>
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

    closeModal() {
        const modal = document.querySelector('.results-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        document.body.style.overflow = 'auto';
    }

    closeQuiz() {
        const modal = document.getElementById('quiz-modal');
        modal.classList.remove('show');
        
        // Clear quiz data
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        setTimeout(() => {
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = { success: '🎉', error: '❌', info: '💡', warning: '⚠️' };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || '💡'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 5000);

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        });
    }
}

// Global quiz engine instance
window.quizEngine = new QuizEngine();

console.log('✅ Quiz Engine loaded successfully');
