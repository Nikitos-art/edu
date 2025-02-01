document.querySelectorAll('.lang_elem').forEach(elem => {
    elem.addEventListener('click', () => {
        const audioFile = elem.getAttribute('data-audio');
        if (audioFile) {
            const audio = new Audio(audioFile);
            audio.play();
        }
    });
});
