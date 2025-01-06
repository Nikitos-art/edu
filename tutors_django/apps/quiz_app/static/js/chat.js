document.addEventListener("DOMContentLoaded", function() {
    var sideNav = document.getElementById("side-nav");
    var contentContainer = document.getElementById("chat-container");

    sideNav.addEventListener("click", function(event) {
        var targetContentId = event.target.dataset.contentId;

        if (targetContentId) {
            // Load the content associated with the clicked menu item
            loadContent(targetContentId);
        }
    });

    function loadContent(contentId) {
        // Hide all content containers
        var contentContainers = document.querySelectorAll(".chat-content");
        contentContainers.forEach(function(container) {
            container.style.display = "none";
        });

        // Show the selected content container
        var selectedContentContainer = document.getElementById(contentId);
        if (selectedContentContainer) {
            selectedContentContainer.style.display = "block";
        }
    }
});