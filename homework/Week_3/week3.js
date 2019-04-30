/*
Name: Lotte van den Berg
Student number: 12427241
This file provides the JavaScript code to plot a line chart.
*/

var fileName = "US_births_2000-2014_SSA.json";

// Send XMLHttpRequest
var txtFile = new XMLHttpRequest();

// Asynchronity: make sure file is fully loaded
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {

      // Parse JSON file
      var data = JSON.parse(txtFile.responseText);

      // Save keys
      var dataKeys = Object.keys(data);
      console.log(dataKeys) // Print statement for testing

      // Create 2D canvas
      var canvas = document.getElementById('linechart');
      var ctx = canvas.getContext('2d');
    }
}
txtFile.open("GET", fileName);
txtFile.send();
