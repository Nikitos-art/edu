document.addEventListener('DOMContentLoaded', (event) => {
    const images = document.getElementsByClassName('pre-img');
    
    for (let i = 0; i < images.length; i++) {
        images[i].addEventListener('click', function() {
            this.classList.toggle('enlarged');
        });
    }
});
