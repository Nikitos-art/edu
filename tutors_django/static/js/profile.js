function toggleContainer(elementName) {
    var container = document.getElementById(elementName);

    if (container.style.display === 'block') {
        container.style.display = 'none';
    } else {
        hideAllContainers();
        container.style.display = 'block';
    }
}

function hideAllContainers() {
    var containers = document.querySelectorAll('.menu-box-item');
    containers.forEach(function (container) {
        container.style.display = 'none';
    });
}

var containers = document.querySelectorAll('.side-li');
containers.forEach(function (container) {
    container.addEventListener('dblclick', function () {
        hideAllContainers();
    });

    container.addEventListener('click', function () {
        toggleContainer(container.dataset.containerId);
    });
});
