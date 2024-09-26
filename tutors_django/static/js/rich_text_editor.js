function formatText(command) {
    document.execCommand(command, false, null);
}

// Before submitting the form, copy the content of the editor to the hidden input
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('form').addEventListener('submit', function() {
        document.getElementById('content').value = document.getElementById('editor').innerHTML;
    });
});
