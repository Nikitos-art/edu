import jsonData from './hanzi_100.js';

let currentHanzi = ''; 


function displayRandomHanzi() {
    const randomIndex = Math.floor(Math.random() * jsonData.length);
    currentHanzi = jsonData[randomIndex].Hanzi; 
    console.log(currentHanzi);
    document.querySelector('.hanzi-char-text').textContent = currentHanzi;
}


function checkAnswer(userSpeech) {
    console.log(`userSpeech: ${userSpeech}`);
    userSpeech = userSpeech.trim(); 
    const correctHanzi = document.querySelector('.hanzi-char-text').innerText; 

    if (userSpeech.length === 1) {  
        if (correctHanzi === userSpeech) {
            console.log('Correct!');
            document.querySelector('.feedback').textContent = 'Correct!';
        } else {
            console.log('Incorrect.');
            document.querySelector('.feedback').textContent = 'Incorrect. Try again!';
        }
    } else {
        console.log('Please say a single character.');
        document.querySelector('.feedback').textContent = 'Please say a single character.';
    }
}


const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'zh-CN';
recognition.maxAlternatives = 10;  
recognition.continuous = false;  


recognition.onstart = function() {
    console.log('Voice recognition started. Speak now.');
};


recognition.onresult = function(event) {
    const userSpeech = event.results[0][0].transcript;
    console.log('User said:', userSpeech);
    checkAnswer(userSpeech);
};


recognition.onend = function() {
    console.log('Speech recognition ended, restarting...');
    recognition.start();  
};


function startRecognition() {
    recognition.start();
}


recognition.interimResults = true;  


document.getElementById('fetch-hanzi-btn').addEventListener('click', displayRandomHanzi);
document.getElementById('speak-btn').addEventListener('click', startRecognition);