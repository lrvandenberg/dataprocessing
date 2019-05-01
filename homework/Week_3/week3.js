/*
Name: Lotte van den Berg
Student number: 12427241
This file provides the JavaScript code to plot a line chart
of the US births from 2000-2014.
*/

// Add filename for GET request
var fileName = "US_births_2000-2014_SSA.json";

// Send XMLHttpRequest
var txtFile = new XMLHttpRequest();

// Asynchronity: make sure file is fully loaded
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {

      // Parse JSON file
      var data = JSON.parse(txtFile.responseText);

      // Preprocess data to workable {x: , y:} format
      var datapoints = preprocess(data);

      // Access the drawing context of the canvas element by its #id
      const ctx = document.getElementById('linechart').getContext('2d');
      const canvas = document.getElementById('linechart');

      // Draw the line chart
      draw(ctx, canvas, datapoints);
    };
};
txtFile.open("GET", fileName);
txtFile.send();

// Functions
function preprocess(data){
  // Save keys in a seperate array for easy access
  var dataKeys = Object.keys(data);

  // Put coordinates in right format
  var dataformat = [];
  for (var i = 0; i < 15; i++) {
    // Convert strings to numbers, devide births by 1000 for better visuality
    dataformat.push({'x': Number(dataKeys[i]), 'y': data[dataKeys[i]]['births']/1000});
  };

  // Return array with JSON objects
  return dataformat;
};

function draw(ctx, canvas, datapoints) {
  // Set ranges for the linechart
  // Padding is the necessary space for writing around the ranges of the linechart
  var padding = 50;
  var xRange = [0 + padding, canvas.width - padding];
  // yRange starts with max value, so the origin of the chart will be in the left bottom corner
  var yRange = [canvas.height - padding, 0 + padding];

  // Draw title of the linechart
  ctx.textAlign = "center";
  ctx.font = "20px Georgia";
  ctx.fillText('US births 2000-2014', canvas.width/2, padding/2);

  // Draw x-label
  ctx.textAlign="right";
  ctx.font = "12px Georgia";
  ctx.fillText('Year', canvas.width - padding, canvas.height - padding/2);

  // Draw y-label
  // Translate and rotate to write vertically
  ctx.save();
  ctx.translate(padding/2, padding);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Births x 1000", 0, 0);
  ctx.restore();

  // Draw x-axis and y-axis
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.moveTo(xRange[0], yRange[1]);
  ctx.lineTo(xRange[0], yRange[0]);
  ctx.lineTo(xRange[1], yRange[0]);
  ctx.stroke();
  ctx.closePath();

  // Linear functions for x and y
  // x min is first year, x max is last year of the datapoints array
  var xDomain = [datapoints[0].x, datapoints[datapoints.length - 1].x];
  // Most y-coordates are between 10-15, so the y domain should be 0-15
  var yDomain = [0, 15];
  var xLine = createTransform(xDomain, xRange);
  var yLine = createTransform(yDomain, yRange);

  // Draw a line from datapoint to datapoint
  ctx.beginPath();
  ctx.lineWidth = 3;
  // Create a variable to wright below the x-axis
  var yWrite = yRange[0] + 10;
  // Write first x value below x-axis
  ctx.fillText(datapoints[0].x, xRange[0], yWrite);
  // Start drawing the line: move to first datapoint
  ctx.moveTo(xLine(datapoints[0].x), yLine(datapoints[0].y));
  for (var i = 1; i < 15; i++) {
    var xNew = xLine(datapoints[i].x);
    var yNew = yLine(datapoints[i].y);
    // Move to the new datapoint
    ctx.lineTo(xNew, yNew);
    // Write x-value below x-axis
    ctx.fillText(datapoints[i].x, xNew, yWrite);
  };
  // Visualize the line in blue
  ctx.strokeStyle = 'blue';
  ctx.stroke();

  // Draw y-values left of y-axis
  // Create a variable to write left of the y-axis
  var xWrite = xRange[0] - 5;
  for (var i = yDomain[0]; i <= yDomain[1]; i += 5) {
    ctx.fillText(i, xWrite, yRange[0] - 10 * i);
  };

};

function createTransform(domain, range){
	// Range_min = alpha * domain_min + beta
	// Range_max = alpha * domain_max + beta
  var alpha = (range[1] - range[0]) / (domain[1] - domain[0]);
  var beta = range[1] - alpha * domain[1];
  // Returns the function for the linear transformation (y= a * x + b)
  return function(x){
    return alpha * x + beta;
  };
};
