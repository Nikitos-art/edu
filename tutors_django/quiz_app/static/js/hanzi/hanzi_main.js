let currentHanzi = '';
let level = 1; // Default to Level 1, can be updated based on user input

// Declare jsonData globally
let jsonData = [];

// Load data based on the selected level
async function loadLevelData() {
    if (level === 1) {
        const data = await import('./hanzi_level_1.js');
        jsonData = data.default; // Adjust based on how the data is exported
    } else if (level === 2) {
        const data = await import('./hanzi_level_2.js');
        jsonData = data.default;
    }
}

// Function to display random Hanzi
function displayRandomHanzi() {
    if (!jsonData || jsonData.length === 0) {
        console.error('Hanzi data not loaded yet.');
        return;
    }

    const randomIndex = Math.floor(Math.random() * jsonData.length);
    currentHanzi = jsonData[randomIndex].Hanzi;
    console.log(currentHanzi);

    const hanziCharText = document.querySelector('.hanzi-char-text');
    hanziCharText.textContent = currentHanzi;

    // Adjust size based on level
    if (level === 1) {
        hanziCharText.style.fontSize = '10rem'; // Larger size for Level 1
        hanziCharText.style.fontWeight = 'bold'; // Optional: Make it bold
    } else if (level === 2) {
        hanziCharText.style.fontSize = '2rem'; // Default size for Level 2
        hanziCharText.style.fontWeight = 'normal'; // Reset weight
    }

    // Toggle speak button visibility
    const speakButton = document.getElementById('speak-btn');
    if (level === 1) {
        speakButton.style.display = 'none';
    } else if (level === 2) {
        speakButton.style.display = 'block';
    }
}


// Load level data and set up event listeners
loadLevelData().then(() => {
    document.getElementById('fetch-hanzi-btn').addEventListener('click', displayRandomHanzi);
    if (level === 2) {
        document.getElementById('speak-btn').addEventListener('click', startRecognition);
    }
});
