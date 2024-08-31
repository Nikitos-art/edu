import { wordList } from './words.js';

function getRandomWords(wordList, gridSize) {
    const randomWords = [];

    for (let i = 0; i < gridSize; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        const wrdObject = wordList[randomIndex];

        const position = {
            row: Math.floor(Math.random() * gridSize),
            col: Math.floor(Math.random() * gridSize)
        };

        const direction = Math.random() > 0.5 ? 'across' : 'down';

        randomWords.push({ ...wrdObject, position, direction});
    }
    return randomWords;
}

function displayHints(randomWords) {
    const acrossList = document.getElementById('across');
    const downList = document.getElementById('down');
    randomWords.forEach((wordObj, index) => {
        const listItem = document.createElement('li');
        const { word, hint, direction } = wordObj;
        listItem.textContent = `${index + 1}. ${hint}`;
        if (direction == 'across') {
            acrossList.appendChild(listItem);
        } else if (direction == 'down') {
            downList.appendChild(listItem);
        }
    });
}

function createGrid(rows, cols) {
    const gridContainer = document.getElementById('crossword-grid');
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.id = `cell-${row}-${col}`;
            cell.className = 'grid-cell';
            gridContainer.appendChild(cell);
        }
    }
}

function placeWordsOnGrid(randomWords) {
    randomWords.forEach((wordObj, index) => {
        const { word, position, direction } = wordObj;
        let row = position.row;
        let col = position.col;

        for (let i = 0; i < word.length; i++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) {
                if (i === 0) {
                    //cell.innerHTML = `<div class="background-number">${index + 1}</div>${word[i]}`;
                    cell.style.backgroundColor = 'lightblue';
                }
                cell.textContent = word[i];

                if (direction === 'across') {
                    col++;
                } else if (direction === 'down') {
                    row++;
                }
            }
        }
    });
}


createGrid(10, 10);
const selectedWords = getRandomWords(wordList, 10);
displayHints(selectedWords);
placeWordsOnGrid(selectedWords);





// function placeWordsOnGrid(randomWords) {
//     randomWords.forEach((wordObj, index) => {
//         const { word, position, direction } = wordObj;
//         let row = position.row;
//         let col = position.col;

//         for (let i = 0; i < word.length; i++) {
//             const cell = document.getElementById(`cell-${row}-${col}`);
//             if (cell) {
//                 if (i === 0) {
//                     //cell.innerHTML = `<div class="background-number">${index + 1}</div>${word[i]}`;
//                     cell.style.backgroundColor = 'lightblue';
//                     //cell.innerHTML = `<span class="background-number">${index + 1}</span>`; 
//                     //const backgroundNumber = document.createElement('span');
//                     //backgroundNumber.className = 'background-number';
//                     //backgroundNumber.textContent = index + 1;
//                     //backgroundNumber.innerHTML = `${index + 1}`;
//                     //cell.appendChild(backgroundNumber);
//                     //cell.innerHTML = backgroundNumber;
//                     //cell.innerHTML = `<span class="background-number">${index + 1}</span>`
//                 }
//                 cell.textContent = word[i];

//                 if (direction === 'across') {
//                     col++;
//                 } else if (direction === 'down') {
//                     row++;
//                 }
//             }
//         }
//     });
// }