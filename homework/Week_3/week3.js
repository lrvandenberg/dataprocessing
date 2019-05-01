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

      // Preprocess data to workable {x: , y:} format
      var datapoints = preprocess(data);

      // Access the drawing context of the canvas element with id=linechart
      const ctx = document.getElementById('linechart').getContext('2d');
      const canvas = document.getElementById('linechart')

      // Draw the line chart
      draw(ctx, canvas, datapoints);
    }
}
txtFile.open("GET", fileName);
txtFile.send();

function preprocess(data){
  // Save keys in a seperate array for easy access
  var dataKeys = Object.keys(data);

  // Put coordinates in right format
  var dataformat = [];
  for (var i = 0; i < 15; i++) {
    dataformat.push({'x': Number(dataKeys[i]), 'y': data[dataKeys[i]]['births']/1000});
  };

  return dataformat;
};

function draw(ctx, canvas, datapoints) {
  // Set ranges for the line chart
  var padding = 50;
  var xRange = [0 + padding, canvas.width - padding];
  // yRange starts with max value, so that the origin of the chart is in the left bottom corner
  var yRange = [canvas.height - padding, 0 + padding];

  // Draw title
  ctx.textAlign="center"
  ctx.fillText('US births 2000-2014', canvas.width/2, padding/2);

  // Draw x-label
  ctx.textAlign="right"
  ctx.fillText('Year', canvas.width - padding, canvas.height - padding/2);

  // Draw y-label
  ctx.save();
  ctx.translate(20, 50);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Births x 1000", 0, 0);
  ctx.restore();

  // Draw x-axis and y-axis
  ctx.beginPath();
  ctx.lineWidth = 1;
  // 0 is minimum range, 1 is maximum range (see ranges above)
  ctx.moveTo(xRange[0], yRange[1]);
  ctx.lineTo(xRange[0], yRange[0]);
  ctx.lineTo(xRange[1], yRange[0]);
  ctx.stroke();
  ctx.closePath();

  // Linear functions for x and y
  var xDomain = [datapoints[0].x, datapoints[14].x];
  var yDomain = [0, 15]
  var xLine = createTransform(xDomain, xRange);
  var yLine = createTransform(yDomain, yRange);

  // Draw a line from datapoint to datapoint
  ctx.beginPath();
  ctx.lineWidth = 3;
  var yWrite = yRange[0] + 10;
  ctx.fillText(datapoints[0].x, xRange[0], yWrite);
  ctx.moveTo(xLine(datapoints[0].x), yLine(datapoints[0].y));
  for (var i = 1; i < 15; i++) {
    var xNew = xLine(datapoints[i].x);
    var yNew = yLine(datapoints[i].y);
    console.log(xNew, yNew);
    ctx.lineTo(xNew, yNew);
    ctx.fillText(datapoints[i].x, xNew, yWrite)
  };
  ctx.stroke();

  // Draw y-values
  for (var i = yDomain[0]; i <= yDomain[1]; i += 5) {
    ctx.fillText(i, 45, yRange[0] - 10 * i)
  }

}

function createTransform(domain, range){
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
  var alpha = (range[1] - range[0]) / (domain[1] - domain[0]);
  var beta = range[1] - alpha * domain[1];
  console.log(alpha);
  console.log(beta);
  // returns the function for the linear transformation (y= a * x + b)
  return function(x){
    return alpha * x + beta;
  };
};
