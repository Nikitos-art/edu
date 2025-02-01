import { alpha_list } from './alpha_list.js';

export function characterSelection(char) {
    console.log("Selected character:", char);

    // Find the selected character's data in the alpha_list
    const charData = alpha_list.find(item => item.char === char);
    if (!charData) {
        console.error("Character not found in alpha_list:", char);
        return;
    }

    // Update the letter box
    document.querySelector('.letter_box .letter').textContent = charData.char;
    document.querySelector('.letter_box p:nth-child(2)').textContent = charData.roman;

    // Update the word box
    document.querySelector('.word_box .word').textContent = charData.word;
    document.querySelector('.word_box p:nth-child(2)').textContent = charData.pronunciation;

    // Update the class box
    document.querySelector('.class_box .class span').textContent = charData.class;
    document.querySelector('.class_box p:nth-child(2)').textContent = charData.meaning;
}

// Attach function to global scope
window.characterSelection = characterSelection;