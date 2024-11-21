class Game {
    constructor() {
        this.currentHanzi = '';
        this.level = 0;
        this.jsonData = [];
        this.hanziMainContainer = document.querySelector('.hanzi-main-container');
        this.hanziMenu = document.querySelector('.hanzi-menu');
        this.level1Options = document.querySelector('.level-1-options');
        this.level2Options = document.querySelector('.level-2-options');
        this.currentLevelElement = document.getElementById('current-level');
    }

    async loadLevelData() {
        if (this.level === 1) {
            const data = await import('./hanzi_level_1.js');
            this.jsonData = data.default;
        } else if (this.level === 2) {
            const data = await import('./hanzi_level_2.js');
            this.jsonData = data.default;
        } else {
            console.error('Invalid level selected');
        }
    }

    displayRandomHanzi() {
        if (!this.jsonData || this.jsonData.length === 0) {
            console.error('Hanzi data not loaded yet.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.jsonData.length);
        this.currentHanzi = this.jsonData[randomIndex].Hanzi;
        console.log(this.currentHanzi);

        const hanziCharText = document.querySelector('.hanzi-char-text');
        hanziCharText.textContent = this.currentHanzi;

        if (this.level === 1) {
            hanziCharText.style.fontSize = '10rem';
            hanziCharText.style.fontWeight = 'bold';
        } else if (this.level === 2) {
            hanziCharText.style.fontSize = '2rem';
            hanziCharText.style.fontWeight = 'normal';
        }

        const speakButton = document.getElementById('speak-btn');
        if (this.level === 1) {
            speakButton.style.display = 'none';
        } else if (this.level === 2) {
            speakButton.style.display = 'block';
        }
    }

    updateLevelUI() {
        if (this.currentLevelElement) {
            this.currentLevelElement.textContent = this.level;
        }

        if (this.hanziMenu) {
            this.hanziMenu.classList.remove('hidden');
        }

        if (this.level === 1) {
            this.level1Options.classList.remove('hidden');
            this.level2Options.classList.add('hidden');
        } else if (this.level === 2) {
            this.level2Options.classList.remove('hidden');
            this.level1Options.classList.add('hidden');
        }
    }

    handleLevelSelection(levelLink) {
        this.level = parseInt(levelLink.getAttribute('data-level'), 10);
        console.log(`level: ${this.level}`);
        this.loadLevelData().then(() => {
            this.hanziMainContainer.classList.add('level-selected');
            document.querySelector('.level-selection').style.display = 'none';
            this.updateLevelUI();
        });
    }
    
    checkAnswer() {
        const feedbackElement = document.querySelector('.feedback');
        if (this.level === 1) {
            // Level 1: Pinyin and tone input
            const pinyinInput = document.getElementById('pinyin-input').value.trim();
            const toneInput = document.getElementById('tone-input').value.trim();
            
            if (!pinyinInput || !toneInput) {
                feedbackElement.textContent = 'Please enter both Pinyin and tone.';
                return;
            }
    
            const correctPinyin = this.jsonData.find(item => item.Hanzi === this.currentHanzi).Pinyin;
            const correctTone = this.jsonData.find(item => item.Hanzi === this.currentHanzi).Tone;
    
            // Normalize Pinyin by removing tone marks
            const normalizedInput = removeToneMarks(pinyinInput);
            const normalizedCorrectPinyin = removeToneMarks(correctPinyin);
    
            if (normalizedInput === normalizedCorrectPinyin && toneInput === correctTone) {
                feedbackElement.textContent = 'Correct! Well done!';
            } else {
                feedbackElement.textContent = `Incorrect. Correct answer: ${correctPinyin} ${correctTone}`;
            }
        } else if (this.level === 2) {
            // Level 2: Speech input
            if (speechHandler.recognition) {
                speechHandler.recognition.onresult = (event) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript.trim().toLowerCase();
                    }
    
                    const correctPinyin = this.jsonData.find(item => item.Hanzi === this.currentHanzi).Pinyin.toLowerCase();
    
                    // Normalize the transcript by removing tone marks
                    const normalizedTranscript = removeToneMarks(transcript);
                    const normalizedCorrectPinyin = removeToneMarks(correctPinyin);
    
                    if (normalizedTranscript === normalizedCorrectPinyin) {
                        feedbackElement.textContent = 'Correct! Well done!';
                    } else {
                        feedbackElement.textContent = `Incorrect. Correct answer: ${correctPinyin}`;
                    }
                };
    
                // Start speech recognition for level 2
                speechHandler.recognition.start();
            } else {
                feedbackElement.textContent = 'Speech recognition not available.';
            }
        }
    }
    
}

function removeToneMarks(pinyin) {
    const toneMarks = {
        'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
        'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
        'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
        'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
        'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
        'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü'
    };

    return pinyin.split('').map(char => toneMarks[char] || char).join('');
}


class SpeechRecognitionHandler {
    constructor() {
        this.recognition = null;
        this.startRecognition = null;

        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;

            this.recognition.onstart = () => console.log("Speech recognition started.");
            this.recognition.onerror = (event) => console.error("Speech recognition error", event);
            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                console.log("You said: " + transcript);
            };
            this.recognition.onend = () => console.log("Speech recognition ended.");

            this.startRecognition = () => {
                if (this.recognition) {
                    this.recognition.start();
                } else {
                    console.error("Speech recognition not supported in this browser.");
                }
            };
        } else {
            console.error("Speech recognition is not supported by this browser.");
        }
    }

    attachSpeakButton() {
        const speakButton = document.getElementById('speak-btn');
        if (speakButton) {
            speakButton.addEventListener('click', this.startRecognition);
        }
    }
}

// Initialize game and speech recognition handlers
const game = new Game();
const speechHandler = new SpeechRecognitionHandler();

// Event listeners for level selection
document.querySelectorAll('.level-selection a').forEach((levelLink) => {
    levelLink.addEventListener('click', (event) => {
        event.preventDefault();
        game.handleLevelSelection(levelLink);
    });
});

// Event listeners for game buttons
document.getElementById('fetch-hanzi-btn').addEventListener('click', () => game.displayRandomHanzi());
document.getElementById('submit-answer-btn').addEventListener('click', () => game.checkAnswer());

// Attach speech recognition listener for level 2
speechHandler.attachSpeakButton();
