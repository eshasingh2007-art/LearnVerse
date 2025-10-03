// Quiz Questions Database
window.QuizQuestions = {
    mathematics: [
        {
            id: 'math_001',
            question: 'What is 15 × 7?',
            options: ['95', '105', '115', '125'],
            correct: 1,
            explanation: '15 × 7 = 105. When multiplying by 15, you can think of it as (10 × 7) + (5 × 7) = 70 + 35 = 105.',
            difficulty: 'easy',
            topic: 'arithmetic'
        },
        {
            id: 'math_002',
            question: 'Solve for x: 2x + 8 = 20',
            options: ['x = 4', 'x = 6', 'x = 8', 'x = 10'],
            correct: 1,
            explanation: '2x + 8 = 20. Subtract 8 from both sides: 2x = 12. Divide by 2: x = 6.',
            difficulty: 'medium',
            topic: 'algebra'
        },
        {
            id: 'math_003',
            question: 'What is the area of a circle with radius 5 cm? (π ≈ 3.14)',
            options: ['78.5 cm²', '31.4 cm²', '15.7 cm²', '62.8 cm²'],
            correct: 0,
            explanation: 'Area = πr². With r = 5: Area = 3.14 × 5² = 3.14 × 25 = 78.5 cm².',
            difficulty: 'medium',
            topic: 'geometry'
        },
        {
            id: 'math_004',
            question: 'What is 25% of 80?',
            options: ['15', '20', '25', '30'],
            correct: 1,
            explanation: '25% of 80 = 0.25 × 80 = 20. Or think: 25% is 1/4, so 80 ÷ 4 = 20.',
            difficulty: 'easy',
            topic: 'percentage'
        },
        {
            id: 'math_005',
            question: 'If a triangle has angles 60°, 60°, what is the third angle?',
            options: ['30°', '45°', '60°', '90°'],
            correct: 2,
            explanation: 'Sum of angles in a triangle = 180°. So 60° + 60° + third angle = 180°. Third angle = 60°.',
            difficulty: 'easy',
            topic: 'geometry'
        },
        {
            id: 'math_006',
            question: 'Simplify: √(144)',
            options: ['10', '11', '12', '13'],
            correct: 2,
            explanation: '√144 = 12, because 12 × 12 = 144.',
            difficulty: 'easy',
            topic: 'roots'
        },
        {
            id: 'math_007',
            question: 'What is the slope of the line y = 3x + 5?',
            options: ['3', '5', '3/5', '5/3'],
            correct: 0,
            explanation: 'In the equation y = mx + b, m is the slope. Here m = 3, so slope = 3.',
            difficulty: 'medium',
            topic: 'algebra'
        },
        {
            id: 'math_008',
            question: 'Factor: x² - 9',
            options: ['(x-3)(x+3)', '(x-9)(x+1)', '(x-1)(x-9)', '(x+3)(x+3)'],
            correct: 0,
            explanation: 'x² - 9 is a difference of squares: x² - 3² = (x-3)(x+3).',
            difficulty: 'hard',
            topic: 'algebra'
        },
        {
            id: 'math_009',
            question: 'What is 3² + 4²?',
            options: ['25', '49', '12', '7'],
            correct: 0,
            explanation: '3² + 4² = 9 + 16 = 25. This is also a Pythagorean triple.',
            difficulty: 'easy',
            topic: 'arithmetic'
        },
        {
            id: 'math_010',
            question: 'If 5x - 3 = 17, what is x?',
            options: ['2', '3', '4', '5'],
            correct: 2,
            explanation: '5x - 3 = 17. Add 3: 5x = 20. Divide by 5: x = 4.',
            difficulty: 'medium',
            topic: 'algebra'
        }
    ],
    
    science: [
        {
            id: 'sci_001',
            question: 'What is the chemical symbol for gold?',
            options: ['Go', 'Gd', 'Au', 'Ag'],
            correct: 2,
            explanation: 'Gold\'s chemical symbol is Au, from the Latin word "aurum".',
            difficulty: 'easy',
            topic: 'chemistry'
        },
        {
            id: 'sci_002',
            question: 'What force keeps planets in orbit around the Sun?',
            options: ['Magnetic force', 'Gravitational force', 'Electric force', 'Nuclear force'],
            correct: 1,
            explanation: 'Gravitational force between the Sun and planets keeps them in orbit.',
            difficulty: 'easy',
            topic: 'physics'
        },
        {
            id: 'sci_003',
            question: 'Which organelle is known as the "powerhouse of the cell"?',
            options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
            correct: 2,
            explanation: 'Mitochondria produce ATP (energy) for the cell, earning the nickname "powerhouse".',
            difficulty: 'medium',
            topic: 'biology'
        },
        {
            id: 'sci_004',
            question: 'What is the speed of light in vacuum?',
            options: ['300,000 km/s', '3,000 km/s', '30,000 km/s', '300,000,000 m/s'],
            correct: 3,
            explanation: 'Speed of light = 3 × 10⁸ m/s = 300,000,000 m/s = 300,000 km/s.',
            difficulty: 'medium',
            topic: 'physics'
        },
        {
            id: 'sci_005',
            question: 'What gas do plants absorb during photosynthesis?',
            options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
            correct: 1,
            explanation: 'Plants absorb CO₂ and release O₂ during photosynthesis.',
            difficulty: 'easy',
            topic: 'biology'
        },
        {
            id: 'sci_006',
            question: 'What is the pH of pure water?',
            options: ['6', '7', '8', '9'],
            correct: 1,
            explanation: 'Pure water has a pH of 7, which is neutral (neither acidic nor basic).',
            difficulty: 'medium',
            topic: 'chemistry'
        },
        {
            id: 'sci_007',
            question: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            correct: 1,
            explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
            difficulty: 'easy',
            topic: 'astronomy'
        },
        {
            id: 'sci_008',
            question: 'What is the hardest natural substance on Earth?',
            options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
            correct: 2,
            explanation: 'Diamond is the hardest natural substance, ranking 10 on the Mohs scale.',
            difficulty: 'easy',
            topic: 'chemistry'
        },
        {
            id: 'sci_009',
            question: 'How many bones are in the adult human body?',
            options: ['198', '206', '215', '223'],
            correct: 1,
            explanation: 'An adult human has 206 bones. Babies are born with about 270 bones.',
            difficulty: 'medium',
            topic: 'biology'
        },
        {
            id: 'sci_010',
            question: 'What is the formula for water?',
            options: ['H₂O', 'HO₂', 'H₂O₂', 'H₃O'],
            correct: 0,
            explanation: 'Water is H₂O - two hydrogen atoms bonded to one oxygen atom.',
            difficulty: 'easy',
            topic: 'chemistry'
        }
    ],
    
    english: [
        {
            id: 'eng_001',
            question: 'Which word is a synonym for "happy"?',
            options: ['Sad', 'Joyful', 'Angry', 'Tired'],
            correct: 1,
            explanation: '"Joyful" means happy or filled with joy.',
            difficulty: 'easy',
            topic: 'vocabulary'
        },
        {
            id: 'eng_002',
            question: 'Identify the verb in this sentence: "The cat sleeps peacefully."',
            options: ['cat', 'sleeps', 'peacefully', 'The'],
            correct: 1,
            explanation: '"Sleeps" is the action word (verb) in this sentence.',
            difficulty: 'easy',
            topic: 'grammar'
        },
        {
            id: 'eng_003',
            question: 'What is the past tense of "run"?',
            options: ['runned', 'ran', 'running', 'runs'],
            correct: 1,
            explanation: 'The past tense of "run" is "ran" (irregular verb).',
            difficulty: 'easy',
            topic: 'grammar'
        },
        {
            id: 'eng_004',
            question: 'Which sentence uses correct punctuation?',
            options: [
                'Hello, how are you.',
                'Hello how are you?',
                'Hello, how are you?',
                'Hello; how are you.'
            ],
            correct: 2,
            explanation: 'Questions should end with a question mark, and a comma is needed after "Hello".',
            difficulty: 'medium',
            topic: 'punctuation'
        },
        {
            id: 'eng_005',
            question: 'What type of word is "quickly" in: "She ran quickly"?',
            options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
            correct: 3,
            explanation: '"Quickly" modifies the verb "ran" and tells us how she ran, making it an adverb.',
            difficulty: 'medium',
            topic: 'grammar'
        },
        {
            id: 'eng_006',
            question: 'Choose the correct spelling:',
            options: ['Recieve', 'Receive', 'Receave', 'Recive'],
            correct: 1,
            explanation: 'The correct spelling is "receive" - remember "i before e except after c".',
            difficulty: 'medium',
            topic: 'spelling'
        },
        {
            id: 'eng_007',
            question: 'What is a metaphor?',
            options: [
                'A direct comparison using like or as',
                'A comparison without using like or as',
                'A repeated sound',
                'An exaggeration'
            ],
            correct: 1,
            explanation: 'A metaphor is a direct comparison that doesn\'t use "like" or "as" (e.g., "Life is a journey").',
            difficulty: 'hard',
            topic: 'literature'
        },
        {
            id: 'eng_008',
            question: 'Which is the correct plural of "child"?',
            options: ['childs', 'childrens', 'children', 'childes'],
            correct: 2,
            explanation: '"Children" is the correct irregular plural form of "child".',
            difficulty: 'easy',
            topic: 'grammar'
        },
        {
            id: 'eng_009',
            question: 'What does the prefix "un-" mean in "unhappy"?',
            options: ['very', 'not', 'again', 'before'],
            correct: 1,
            explanation: 'The prefix "un-" means "not", so "unhappy" means "not happy".',
            difficulty: 'easy',
            topic: 'vocabulary'
        },
        {
            id: 'eng_010',
            question: 'Which sentence is in passive voice?',
            options: [
                'The dog chased the cat.',
                'Mary reads the book.',
                'The cake was eaten by John.',
                'They are playing football.'
            ],
            correct: 2,
            explanation: 'Passive voice: "The cake was eaten by John." The subject receives the action.',
            difficulty: 'hard',
            topic: 'grammar'
        }
    ],
    
    social: [
        {
            id: 'soc_001',
            question: 'Who was the first Prime Minister of India?',
            options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Dr. APJ Abdul Kalam'],
            correct: 1,
            explanation: 'Jawaharlal Nehru became India\'s first Prime Minister on August 15, 1947.',
            difficulty: 'easy',
            topic: 'history'
        },
        {
            id: 'soc_002',
            question: 'Which river is known as the "Ganga of the South"?',
            options: ['Krishna', 'Godavari', 'Kaveri', 'Narmada'],
            correct: 2,
            explanation: 'The Kaveri river is often called the "Ganga of the South" due to its religious significance.',
            difficulty: 'medium',
            topic: 'geography'
        },
        {
            id: 'soc_003',
            question: 'In which year did India gain independence?',
            options: ['1946', '1947', '1948', '1949'],
            correct: 1,
            explanation: 'India gained independence from British rule on August 15, 1947.',
            difficulty: 'easy',
            topic: 'history'
        },
        {
            id: 'soc_004',
            question: 'What is the capital of Rajasthan?',
            options: ['Jodhpur', 'Udaipur', 'Jaipur', 'Kota'],
            correct: 2,
            explanation: 'Jaipur, also known as the Pink City, is the capital of Rajasthan.',
            difficulty: 'easy',
            topic: 'geography'
        },
        {
            id: 'soc_005',
            question: 'Which fundamental right is known as the "Heart and Soul" of the Constitution?',
            options: ['Right to Equality', 'Right to Constitutional Remedies', 'Right to Freedom', 'Right to Life'],
            correct: 1,
            explanation: 'Dr. Ambedkar called the Right to Constitutional Remedies the "Heart and Soul" of the Constitution.',
            difficulty: 'hard',
            topic: 'civics'
        },
        {
            id: 'soc_006',
            question: 'Which is the longest river in India?',
            options: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'],
            correct: 1,
            explanation: 'The Ganga is the longest river in India, flowing 2,525 km from the Himalayas to the Bay of Bengal.',
            difficulty: 'medium',
            topic: 'geography'
        },
        {
            id: 'soc_007',
            question: 'Who wrote the Indian National Anthem?',
            options: ['Rabindranath Tagore', 'Bankim Chandra Chattopadhyay', 'Sarojini Naidu', 'Subhash Chandra Bose'],
            correct: 0,
            explanation: 'Rabindranath Tagore wrote "Jana Gana Mana", India\'s National Anthem.',
            difficulty: 'medium',
            topic: 'history'
        },
        {
            id: 'soc_008',
            question: 'Which mountain range separates Europe and Asia?',
            options: ['Himalayas', 'Alps', 'Ural Mountains', 'Rockies'],
            correct: 2,
            explanation: 'The Ural Mountains form the traditional boundary between Europe and Asia.',
            difficulty: 'medium',
            topic: 'geography'
        },
        {
            id: 'soc_009',
            question: 'What is the currency of Japan?',
            options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
            correct: 2,
            explanation: 'The Japanese Yen (¥) is the official currency of Japan.',
            difficulty: 'easy',
            topic: 'geography'
        },
        {
            id: 'soc_010',
            question: 'Which Mughal emperor built the Taj Mahal?',
            options: ['Akbar', 'Shah Jahan', 'Humayun', 'Aurangzeb'],
            correct: 1,
            explanation: 'Shah Jahan built the Taj Mahal in memory of his wife Mumtaz Mahal.',
            difficulty: 'easy',
            topic: 'history'
        }
    ]
};

// Quiz difficulty progression system
window.QuizDifficulty = {
    easy: { minScore: 0, maxScore: 100, nextLevel: 'medium' },
    medium: { minScore: 70, maxScore: 100, nextLevel: 'hard', prevLevel: 'easy' },
    hard: { minScore: 80, maxScore: 100, prevLevel: 'medium' }
};

// Topic categories for better organization
window.QuizTopics = {
    mathematics: ['arithmetic', 'algebra', 'geometry', 'percentage', 'roots'],
    science: ['physics', 'chemistry', 'biology', 'astronomy'],
    english: ['vocabulary', 'grammar', 'punctuation', 'spelling', 'literature'],
    social: ['history', 'geography', 'civics']
};

// Subject metadata
window.SubjectInfo = {
    mathematics: {
        name: 'Mathematics',
        icon: '🧮',
        description: 'Numbers, equations, and problem-solving'
    },
    science: {
        name: 'Science',
        icon: '🧪',
        description: 'Physics, Chemistry, Biology, and more'
    },
    english: {
        name: 'English',
        icon: '📚',
        description: 'Grammar, vocabulary, and literature'
    },
    social: {
        name: 'Social Studies',
        icon: '🌍',
        description: 'History, geography, and civics'
    }
};

console.log('✅ Quiz questions database loaded successfully!');
console.log('📊 Question counts:', 
    Object.keys(QuizQuestions).map(subject => 
        `${subject}: ${QuizQuestions[subject].length} questions`
    ).join(', ')
);
