function formatText(command, value = null) {
    document.execCommand(command, false, value);
}

function toggleHighlight() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const currentNode = range.commonAncestorContainer.parentElement;

    if (currentNode.style.backgroundColor === 'yellow') {
        document.execCommand('hiliteColor', false, 'transparent');
    } else {
        document.execCommand('hiliteColor', false, 'yellow');
    }
}

function changeFontColor(color) {
    document.execCommand('foreColor', false, color);
}

function resetFontColor() {
    document.execCommand("foreColor", false, "black");
}

function adjustFontSize(increase) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const currentNode = range.commonAncestorContainer.parentElement;

    let currentSize = parseInt(window.getComputedStyle(currentNode).fontSize);
    currentSize = increase ? currentSize + 1 : currentSize - 1;
    currentNode.style.fontSize = `${currentSize}px`;

    // Display the current size in the console (or elsewhere if you prefer)
    console.log(`Font size: ${currentSize}px`);
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('form').addEventListener('submit', function() {
        document.getElementById('content').value = document.getElementById('editor').innerHTML;
    });
});
