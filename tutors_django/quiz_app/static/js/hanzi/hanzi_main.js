class Game {
    constructor() {
        this.currentHanzi = '';
        this.level = 0;
        this.jsonData = [];
        this.hanziMainContainer = document.querySelector('.hanzi-main-container');
        this.hanziMenu = document.querySelector('.hanzi-menu');
        this.level1Options = document.querySelector('.level-1-options');
        this.level2Options = document.querySelector('.level-2-options');
        this.toneInput = null;

        // Speech recognition setup
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.lang = 'zh-CN';
        this.recognition.maxAlternatives = 10;
        this.recognition.continuous = false;

        this.recognition.onresult = (event) => {
            const userSpeech = event.results[0][0].transcript.trim();
            console.log('User said:', userSpeech);
            this.checkAnswer(userSpeech);
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended.');
        };
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
        const feedbackElement = document.querySelector('.feedback');
        feedbackElement.textContent = '';

        const pinyinInput = document.getElementById('pinyin-input');
        pinyinInput.value = '';

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
            hanziCharText.style.fontSize = '5rem';
            hanziCharText.style.fontWeight = 'normal';
        }

        const speakButton = document.getElementById('speak-btn');
        if (this.level === 1) {
            speakButton.style.display = 'none';
        } else if (this.level === 2) {
            speakButton.style.display = 'block';
            speakButton.onclick = () => this.startRecognition(); // Start recording for Level 2
        }
    }

    speakHanzi() {
        const utterance = new SpeechSynthesisUtterance(this.currentHanzi);
        utterance.lang = 'zh-CN'; // Set the language to Chinese
        window.speechSynthesis.speak(utterance);
    }

    startRecognition() {
        console.log('Starting speech recognition...');
        this.recognition.start();
    }

    updateLevelUI() {
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

    checkAnswer(userSpeech = '') {
        const feedbackElement = document.querySelector('.feedback');

        if (this.level === 1) {
            const pinyinInput = document.getElementById('pinyin-input').value.trim();

            if (!this.toneInput || !pinyinInput) {
                feedbackElement.textContent = 'Please enter both Pinyin and tone.';
                return;
            }

            const correctPinyin = this.jsonData.find(item => item.Hanzi === this.currentHanzi).Pinyin;
            const correctTone = this.jsonData.find(item => item.Hanzi === this.currentHanzi).Tone;

            const normalizedInput = removeToneMarks(pinyinInput);
            const normalizedCorrectPinyin = removeToneMarks(correctPinyin);

            if (normalizedInput === normalizedCorrectPinyin && this.toneInput === correctTone) {
                displayFeedback(1);
            } else {
                displayFeedback(0, correctPinyin, correctTone);
            }
        } else if (this.level === 2) {
            if (!userSpeech) {
                feedbackElement.textContent = 'Please speak a character.';
                return;
            }

            if (userSpeech === this.currentHanzi) {
                displayFeedback(1);
            } else {
                const correctPinyin = this.jsonData.find(item => item.Hanzi === this.currentHanzi).Pinyin;
                displayFeedback(0, correctPinyin);
            }
        }
    }
}

// Helper functions
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

function displayFeedback(answer, correctAnswer = null, correctTone = null) {
    const feedbackElement = document.querySelector('.feedback');
    feedbackElement.textContent = '';

    const imgElement = document.createElement('img');
    imgElement.src = '/static/img/god.svg';
    imgElement.alt = 'God';
    imgElement.style.width = '3em';
    imgElement.style.height = 'auto';

    const textNode = answer 
        ? document.createTextNode('非常好! Well done!') 
        : (() => {
            const span = document.createElement('span');
            span.innerHTML = `错! Incorrect! <span style="font-size: 1rem;">(${correctAnswer} was correct)</span>`;
            return span;
        })();

    feedbackElement.appendChild(imgElement);
    feedbackElement.appendChild(textNode);
}

// Tone button click listener setup
document.addEventListener('DOMContentLoaded', () => {
    const toneButtons = document.getElementById('tone-buttons');
    toneButtons.addEventListener('click', function(event) {
        if (event.target && event.target.classList.contains('tone-btn')) {
            const tone = event.target.getAttribute('data-tone');
            console.log('Selected tone:', tone);
            game.toneInput = tone; 
            event.target.classList.add('focus');
        }
    });
});

// Initialize game
const game = new Game();
document.querySelectorAll('.level-selection a').forEach((levelLink) => {
    levelLink.addEventListener('click', (event) => {
        event.preventDefault();
        game.handleLevelSelection(levelLink);
    });
});

document.getElementById('fetch-hanzi-btn').addEventListener('click', () => game.displayRandomHanzi());
document.getElementById('submit-answer-btn').addEventListener('click', () => game.checkAnswer());
