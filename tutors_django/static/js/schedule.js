document.addEventListener("DOMContentLoaded", function () {
  var popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]')
  );
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var cells = document.querySelectorAll("td");
  var monYear = document.querySelector("th.month").textContent;
  var form = document.getElementById('lessonForm');
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  cells.forEach(function (cell) {
    cell.addEventListener('click', function () {
      var day = cell.innerHTML;
      cell.setAttribute('data-bs-toggle', 'modal');
      cell.setAttribute('data-bs-target', '#exampleModal');

      var parts = monYear.split(" ");
      var monthName = parts[0];
      var year = parts[1];

      // Convert month name to numerical representation
      var month = monthNames.indexOf(monthName) + 1;

      // Format the date for the input element
      var formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
      form.elements['lesson_date'].value = formattedDate;
    });
  });
});

