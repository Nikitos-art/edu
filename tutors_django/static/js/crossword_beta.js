import { wordList } from './words_1.js';

const GRID_SIZE = 17;


function initializeGrid(grid_size, emptyCell = '_') {
    let grid = Array.from(Array(grid_size), () => new Array(grid_size));
    for (let row = 0; row < grid_size; row++) {
      for (let column = 0; column < grid_size; column++) {
        grid[row][column] = emptyCell;
      }
    }
    return grid;
}

function displayHints(wordNum, hint, isHorizontal) {
  const acrossList = document.getElementById('across');
  const downList = document.getElementById('down');
  
  const listItem = document.createElement('li');
  listItem.classList.add('hints-list-item');
  listItem.textContent = `${wordNum}. ${hint}`;

  listItem.setAttribute('data-word-num', wordNum);
  listItem.setAttribute('data-is-horizontal', isHorizontal);

  if (isHorizontal) { 
    acrossList.appendChild(listItem);
  } else { 
    downList.appendChild(listItem);
  }
}

function clearHints() {
  const acrossList = document.getElementById('across');
  const downList = document.getElementById('down');

  const acrossItems = acrossList.querySelectorAll('li');
  acrossItems.forEach(item => item.remove());

  const downItems = downList.querySelectorAll('li');
  downItems.forEach(item => item.remove());
}

function haveCommonLetters(word1, word2) {
  const set1 = new Set(word1);
  const set2 = new Set(word2);
  const commonLetters = [];

  for (let letter of set1) {
    if (set2.has(letter)) {
      //console.log(`Found common letter: ${letter} in words "${word1}" and "${word2}"`);
      commonLetters.push(letter);
    }
  }

  return commonLetters.length > 0 ? commonLetters : false;
}

function isPaddingValid(row, col, char, letterIndex, isHorizontal, wordLength, gridResult, word, firstLetterPrevWord, emptyCell = '_') {

    const isRowInBounds = row >= 0 && row < gridResult.length;
    const isColInBounds = col >= 0 && col < gridResult[0].length;

    if (!isRowInBounds || !isColInBounds) {
        //console.log(`out of bounds. word: ${word}, letter: ${char}`);
        return false;
    }

    // Validate the current cell based on the character or empty status
    const cellValue = gridResult[row][col];
    //console.log(cellValue);
    if (cellValue !== emptyCell && cellValue !== char) {
        //console.log(`failed cell check test. word: ${word}, letter: ${char}`);
        return false;
    }

    // Check padding before the first letter
    if (letterIndex === 0) {
        const beforeRow = isHorizontal ? row : row - 1;
        const beforeCol = isHorizontal ? col - 1 : col;

        if (char === firstLetterPrevWord) {
          //console.log(`failed first letter different index test. word: ${word}, letter: ${char}`);
          return false;
        }

        if (
            beforeRow >= 0 && beforeRow < gridResult.length &&
            beforeCol >= 0 && beforeCol < gridResult[0].length
        ) {
            const beforeCell = gridResult[beforeRow][beforeCol];
            if (beforeCell !== emptyCell) {
                //console.log(`failed beforeCell test. word: ${word}, letter: ${char}`);
                return false;
            }
        }
        //console.log(`sucessfully checked the first letter: "${word[letterIndex]}" of the word ${word}.`);
    }

    // Check padding after the last letter
    if (letterIndex === wordLength - 1) {
        const afterRow = isHorizontal ? row : row + 1;
        const afterCol = isHorizontal ? col + 1 : col;
        if (
            afterRow >= 0 && afterRow < gridResult.length &&
            afterCol >= 0 && afterCol < gridResult[0].length
        ) {
            const afterCell = gridResult[afterRow][afterCol];
            if (afterCell !== emptyCell) {
                //console.log(`failed afterCell test. word: ${word}, letter: ${char}`);
                return false;
            }
          }
        if (isHorizontal) {
          const checkAbove = row > 0 && gridResult[row - 1][col] !== emptyCell;
          const checkBelow = row < gridResult.length - 1 && gridResult[row + 1][col] !== emptyCell;
          if (checkAbove || checkBelow) {
              return false;
          }
        }
        if (!isHorizontal) {
          const checkLeft = col > 0 && gridResult[row][col - 1] !== emptyCell;
          const checkRight = col < gridResult[0].length - 1 && gridResult[row][col + 1] !== emptyCell;
          if (checkLeft || checkRight) {
              return false;
          }
        }
        //console.log(`sucessfully checked the last letter: "${word[letterIndex]}" of the word ${word}.`);
    }

    if (isHorizontal && letterIndex !== 0 && letterIndex !== wordLength - 1) {
      const checkAbove = row > 0 && gridResult[row - 1][col] !== emptyCell;
      const checkBelow = row < gridResult.length - 1 && gridResult[row + 1][col] !== emptyCell;

      if (checkAbove || checkBelow) {
          //console.log(`failed checkAbove || checkBelow test. word: ${word}, letter: ${char}`);
          return false;
      }
    }

    if (!isHorizontal && letterIndex !== 0 && letterIndex !== wordLength - 1) {
        const checkLeft = col > 0 && gridResult[row][col - 1] !== emptyCell;
        const checkRight = col < gridResult[0].length - 1 && gridResult[row][col + 1] !== emptyCell;

        if (checkLeft || checkRight) {
            //console.log(`failed checkLeft || checkRight test. word: ${word}, letter: ${char}`);
            return false;
        }
    }
    //console.log(`padding of the char ${char} of word ${word} is OK`);
    return true;
}

function canWordBePlaced(word, startRow, startCol, gridResult, isHorizontal, previousWord) {
    const firstLetterPrevWord = previousWord[0];
    const wordLength = word.length;
    for (let j = 0; j < wordLength; j++) {
        const currentLetter = word[j];

        if (isHorizontal) {
            const col = startCol + j;
            if (!isPaddingValid(startRow, col, currentLetter, j, isHorizontal, wordLength, gridResult, word, firstLetterPrevWord)) {
                //console.log(`!!!the currentLetter ${currentLetter} of word ${word} should NOT be be placed!!!`)
                return false;
            }   
        } else {
            const row = startRow + j;
            if (!isPaddingValid(row, startCol, currentLetter, j, isHorizontal, wordLength, gridResult, word, firstLetterPrevWord)) {
                //console.log(`!!!the currentLetter ${currentLetter} of word ${word} should NOT be be placed!!!`)
                return false;
            }  
        }
    }
    //console.log(`*****the word ${word} is most likely going to be placed*****`)
    return true;
}

function placeTheWord(word, startRow, startCol, gridResult, isHorizontal) {
  for (let j = 0; j < word.length; j++) {
    if (isHorizontal) {
      const col = startCol + j;
      gridResult[startRow][col] = word[j];

    } else {
      const row = startRow + j;
      gridResult[row][startCol] = word[j];

    }
  }
}

function createGridLayoutWithWordsOnIt(gridResult, wordObjList) {

  const grid_dimensions = gridResult.length;  
  let gridElem = document.getElementById('grid');

  if (gridElem) {
      gridElem.style.display = 'grid';
      gridElem.innerHTML = '';
      gridElem.style.gridTemplateColumns = `repeat(${grid_dimensions}, 1fr)`;

      for (let row = 0; row < grid_dimensions; row++) {
          for (let col = 0; col < grid_dimensions; col++) {
              const cell = document.createElement('div');
              cell.id = `grid-cell-${row}-${col}`;
              cell.className = 'grid-cell'; 
              cell.style.border = '1px solid #ddd'; 
              cell.style.boxSizing = 'border-box';
              cell.dataset.letter = gridResult[row][col].toUpperCase();
              cell.textContent = ''; //hide the letters
              //cell.textContent = gridResult[row][col] !== '_' ? gridResult[row][col] : ''; // show the letters

              if (gridResult[row][col] !== '_') {
                cell.style.backgroundColor = 'lightblue';
                cell.addEventListener('click', () => {
                  handleCellClick(
                    cell, 
                    row, 
                    col, 
                    cell.dataset.wordNumbering,
                    wordObjList
                  );
                });
                    // Add a hover effect manually using mouseover and mouseout events
                cell.addEventListener('mouseover', () => {
                  cell.style.backgroundColor = '#87ceeb';  
                  cell.style.borderColor = '#005f8d';      
                  cell.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)'; 
                });

                cell.addEventListener('mouseout', () => {
                  cell.style.backgroundColor = 'lightblue';
                  cell.style.border = '1px solid #ddd';        
                  cell.style.boxShadow = 'none';             
                });
              }
              // Check if this cell is a starting position for any word in wordObjList
              const wordStart = wordObjList.find(wordObj =>
                wordObj.startRow === row && wordObj.startCol === col
              );
              
              if (wordStart) {
                addIndicatorToCell(cell, wordObjList.indexOf(wordStart) + 1);
              }

              gridElem.appendChild(cell);
          }
      }

      wordObjList.forEach(wordObj => {
        const { word, startRow, startCol, isHorizontal, wordNumbering } = wordObj;
        //console.log(wordNumbering);
        for (let i = 0; i < word.length; i++) {
            // Determine the cell position for each letter in the word
            const row = isHorizontal ? startRow : startRow + i;
            const col = isHorizontal ? startCol + i : startCol;
            const cell = document.getElementById(`grid-cell-${row}-${col}`);
            // Attach metadata
            if (cell) {
                cell.dataset.wordNumbering = wordNumbering;
            }
        }
      });

      return gridElem;
  } else {
      console.error("Element with id 'grid' not found.");
      return null;
  }
}

function addIndicatorToCell(cell, number) {
  let existingIndicator = cell.querySelector('.word-indicator');
  if (existingIndicator) {
    console.log("ok here we go.", cell, number);
    existingIndicator.innerText += `, ${number}`;
  } else {
    const indicator = document.createElement('span');
    indicator.innerText = number;
    indicator.className = 'word-indicator';  
    cell.appendChild(indicator);
  }
}

function handleCellClick(cell, row, col, wordNumbering, wordObjList) {
  highlightHint(wordNumbering);
  //console.log(`the number of the word clicked is is ${wordNumbering}`);
  cell.contentEditable = true;
  cell.focus();

  cell.addEventListener('keydown', (event) => {
      const letterSpan = cell.querySelector('.typed-letter');
      const indicator = cell.querySelector('.word-indicator');

      // Handle typing of single letters
      if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
          event.preventDefault(); // Prevent default typing behavior

          // Ensure only one letter per cell
          if (letterSpan) {
              letterSpan.textContent = event.key.toUpperCase(); // Replace the existing letter
          } else {
              const newLetterSpan = document.createElement('span');
              newLetterSpan.className = 'typed-letter';
              newLetterSpan.textContent = event.key.toUpperCase(); // Add the typed letter
              if (indicator) {
                  cell.insertBefore(newLetterSpan, indicator); // Keep the indicator at the top
              } else {
                  cell.appendChild(newLetterSpan); // In case there's no indicator
              }
          }
        checkWordFilled(row, col, wordObjList);
      }

      if (event.key === 'Backspace') {
          event.preventDefault(); // Prevent default backspace behavior

          if (letterSpan) {
              letterSpan.textContent = ''; // Clear the letter but keep the indicator
          }
      }
  });
}

function checkWordFilled(row, col, wordObjList) {
  // Loop through wordObjList to find the word that starts from (row, col)
  wordObjList.forEach((wordObj) => {
    let filled = true;
    let correct = true;
    const { startRow, startCol, isHorizontal, word } = wordObj;
    const wordLength = word.length;

    for (let i = 0; i < wordLength; i++) {
      let currentCell;
      if (isHorizontal) {
        currentCell = document.getElementById(`grid-cell-${startRow}-${startCol + i}`);
      } else {
        currentCell = document.getElementById(`grid-cell-${startRow + i}-${startCol}`);
      }

      const letterSpan = currentCell.querySelector('.typed-letter');
      const letter = letterSpan ? letterSpan.textContent : '';

      if (!letter) {
        filled = false;
        break;
      }

      // Check if the typed letter matches the correct one
      if (letter !== currentCell.dataset.letter) {
        correct = false;
      }
    }

    if (filled) {
      if (correct) {
        markWordCorrect(wordObj); // Mark word as correct (e.g., highlight)
      } else {
        markWordIncorrect(wordObj); // Mark word as incorrect (e.g., add red border)
      }

      // Check if all words are now correct to congratulate the user
      if (areAllWordsCorrect(wordObjList)) {
        console.log("checkWordFilled if condition is triggered");
        congratulateUser();
      }
    }
  });
}

function markWordCorrect(wordObj) {
  const { startRow, startCol, isHorizontal, word } = wordObj;
  for (let i = 0; i < word.length; i++) {
    let cell;
    if (isHorizontal) {
      cell = document.getElementById(`grid-cell-${startRow}-${startCol + i}`);
    } else {
      cell = document.getElementById(`grid-cell-${startRow + i}-${startCol}`);
    }
    cell.style.outline = '2px solid green'; // Mark as correct (green outline)
  }
}

function markWordIncorrect(wordObj) {
  const { startRow, startCol, isHorizontal, word } = wordObj;
  for (let i = 0; i < word.length; i++) {
    let cell;
    if (isHorizontal) {
      cell = document.getElementById(`grid-cell-${startRow}-${startCol + i}`);
    } else {
      cell = document.getElementById(`grid-cell-${startRow + i}-${startCol}`);
    }
    cell.style.outline = '2px solid red'; 
  }
}

function areAllWordsCorrect(wordObjList) {
  //console.log("areAllWordsCorrect function is triggered")
  return wordObjList.every((wordObj) => {
    let correct = true;
    const { startRow, startCol, isHorizontal, word } = wordObj;
    for (let i = 0; i < word.length; i++) {
      let cell;
      if (isHorizontal) {
        cell = document.getElementById(`grid-cell-${startRow}-${startCol + i}`);
      } else {
        cell = document.getElementById(`grid-cell-${startRow + i}-${startCol}`);
      }
      const letterSpan = cell.querySelector('.typed-letter');
      const letter = letterSpan ? letterSpan.textContent : '';

      if (letter !== cell.dataset.letter) {
        correct = false;
        break;
      }
    }
    return correct;
  });
}

function congratulateUser() {
  const popup = document.getElementById('victoryPopup');
  if (popup) {
      popup.classList.remove('hidden'); // Show the popup
      const closeButton = document.getElementById('closePopup');
      if (closeButton) {
          closeButton.addEventListener('click', () => {
              popup.classList.add('hidden'); // Hide the popup
          });
      }
  }
}

function highlightHint(wordNumbering) {
  const clickedNum = parseInt(wordNumbering, 10);
  //console.log("after the function input", wordNumbering);
  const acrossList = document.getElementById('across');
  const downList = document.getElementById('down');
  acrossList.querySelectorAll('li').forEach(li => li.classList.remove('highlight'));
  downList.querySelectorAll('li').forEach(li => li.classList.remove('highlight'));

  const listItems = [...acrossList.querySelectorAll('li'), ...downList.querySelectorAll('li')];
  
  listItems.forEach((listItem) => {
  const wordNum = parseInt(listItem.dataset.wordNum, 10);
  if (wordNum === clickedNum) {
    listItem.classList.add('highlight');
    //console.log(`found one right here ${wordNum}`);
  }
  })
}

function main(wordList, numOfWords) {
  let gridResult = initializeGrid(GRID_SIZE);
  let wordObjList = [];
  let startRow = 1, startCol = 1;
  let prevWordStartCol = 0;
  let wordNum = 1;
  let failedWords = [];

  while (wordObjList.length < numOfWords && wordNum < wordList.length) {
    let { word: currentWord, hint } = wordList[wordNum];
    let isHorizontal = (wordNum % 2 === 0) ? 0 : 1;

    if (wordNum === 1) {
        // First word placement
        placeWordAndStore(currentWord, startRow, startCol, isHorizontal, gridResult, wordObjList, hint);
        prevWordStartCol = startCol;
        wordNum++;
    } else {
        let wordPlaced = attemptWordPlacement(currentWord, wordObjList, gridResult, hint, isHorizontal);
        // Try the opposite orientation if the first attempt fails
        if (!wordPlaced) {
            isHorizontal = isHorizontal === 0 ? 1 : 0;
            wordPlaced = attemptWordPlacement(currentWord, wordObjList, gridResult, hint, isHorizontal);
            if (!wordPlaced) {
              failedWords.push(currentWord);
              //console.log(`failed to place the word: ${currentWord}`)
            }
        }
        wordNum++;
    }
  }

  //console.log(`Before failedWords check: ${wordObjList.length}`);
  // console.log(failedWords);
  // for (let failedWord of failedWords) {
  //   let isHorizontal = Math.random() < 0.5 ? 0 : 1; // Randomly try a direction
  //   let wordPlaced = attemptWordPlacement(failedWord.word, wordObjList, gridResult, failedWord.hint, isHorizontal);
  //   if (!wordPlaced) {
  //     isHorizontal = isHorizontal === 0 ? 1 : 0;
  //     attemptWordPlacement(failedWord.word, wordObjList, gridResult, failedWord.hint, isHorizontal);
  //   } else {
  //     console.log(`word "${failedWord.word}" was placed after second attempt.`)
  //   }
  // }
  //console.log(`Before failedWords check: ${wordObjList.length}`);
  //console.log(failedWords.length);
  createGridLayoutWithWordsOnIt(gridResult, wordObjList);
}
// Helper to place a word and store its metadata
function placeWordAndStore(word, startRow, startCol, isHorizontal, grid, wordObjList, hint) {
  let wordNumbering = wordObjList.length + 1; 
  placeTheWord(word, startRow, startCol, grid, isHorizontal);
  wordObjList.push({ word, startRow, startCol, isHorizontal, hint, wordNumbering });
  displayHints(wordNumbering, hint, isHorizontal);
}

function attemptWordPlacement(currentWord, wordObjList, grid, hint, isHorizontal) {

  for (let i = 1; i <= wordObjList.length; i++) {
    let { word: previousWord, isHorizontal: prevWordDir, startRow: prevRow, startCol: prevCol } = wordObjList[wordObjList.length - i];
    let commonLetters = haveCommonLetters(previousWord, currentWord);

    // Check if common letters exist and directions are opposite
    // if (commonLetters && prevWordDir !== isHorizontal) {


    if (commonLetters) {
      // Ensure a different direction before entering the loop
      if (prevWordDir === isHorizontal) {
        isHorizontal = isHorizontal === 0 ? 1 : 0; // Flip direction
      }
    
      for (let commonLetter of commonLetters) {
        let { startRow, startCol } = calculatePlacementPosition(currentWord, previousWord, prevRow, prevCol, commonLetter, isHorizontal);
        
        // Only place the word if it can be placed at the calculated position
        if (canWordBePlaced(currentWord, startRow, startCol, grid, isHorizontal, previousWord)) {
          placeWordAndStore(currentWord, startRow, startCol, isHorizontal, grid, wordObjList, hint);
    
          // Flip direction for the next word placement
          isHorizontal = !isHorizontal;
    
          return true;  
        }
      }
    }
    


  }
  return false;
}

function calculatePlacementPosition(currentWord, previousWord, prevRow, prevCol, commonLetter, isHorizontal) {
  let startRow, startCol;
  if (isHorizontal) {
    startRow = prevRow + previousWord.indexOf(commonLetter);
    startCol = prevCol - currentWord.indexOf(commonLetter);
  } else {
    startRow = prevRow - currentWord.indexOf(commonLetter);
    startCol = prevCol + previousWord.indexOf(commonLetter);
  }
  return { startRow, startCol };
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  }
  return array;
}

function generateCrossword() {
  clearHints();
  const wordCountInput = document.getElementById("wordCount").value;
  let wordsNumber = parseInt(wordCountInput, 10); 
  
  if (isNaN(wordsNumber) || wordsNumber <= 0) {
    alert("Please enter a valid number of words!");
    return;
  }
  const shuffledWordList = shuffle([...wordList]);
  main(shuffledWordList, wordsNumber);
}

window.generateCrossword = generateCrossword; 

