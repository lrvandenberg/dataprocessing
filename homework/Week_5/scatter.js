/*
Name: Lotte van den Berg
Student number: 12427241
This file provides the JavaScript code to compute a scatterplot
of the relationship between teen pregnancies, crime and GDP in Europe.
*/

window.onload = function(){

  // Use of API was not required due to 'unlucky' format, therefore they are locally saved
  var teensInViolentArea = "teensInViolentArea.json"
  var teenPregnancies = "teenPregnancies.json"
  var GDP = "GDP.json"

  // Load in json files
  var requests = [d3.json(teensInViolentArea), d3.json(teenPregnancies), d3.json(GDP)];

  // Make sure all files are loaded
  Promise.all(requests).then(function(response) {

      // Preprocess the data
      var data = preprocess(response);

      // Draw scatterplot when radio button 2012 is checked
      document.getElementById("2012").onclick = function() {

        // remove existing graphs, if any
        d3.selectAll('svg').remove();

        draw(data.option1, '2012')};

      // Draw scatterplot when radio button 2014 is checked
      document.getElementById("2014").onclick = function() {

        // remove existing graphs, if any
        d3.selectAll('svg').remove();

        draw(data.option2, '2014')};
  })

  // Handle errors
  .catch(function(e){throw(e)});
};

// Functions
function preprocess(data) {

  // Step 1: Select all 2012 and 2014 values in the dataset
  var subset = []
  data.forEach(function(set){

    var cleaned = {}
    Object.keys(set).forEach(function (key) {

      // Country
      var country = key

      // Years
      var allyears = {}
      set[key].forEach(function (element) {
        allyears[element.Time | element.Year] =  element.Datapoint
      });
      var twoyears = {}
      twoyears[2012] = allyears[2012]
      twoyears[2014] = allyears[2014]

      // Add country and corresponding years to JSON object
      cleaned[country] = twoyears
    });

    // Store all JSON objects in an array
    subset.push(cleaned);
  });

  // Step 2: Give the subsets more descriptive names
  var xCoordinates = subset[0]
  var yCoordinates = subset[1]
  var color = subset[2]

  // Step 3: Create arrays with datapoints for each option
  option1 = []
  option2 = []

  // Step 3 continued: Use the same countries for an even amount of datapoints
  for (key in color) {
    if (key in xCoordinates & key in yCoordinates){
        datapointsOption1 = {}
        datapointsOption2 = {}

        datapointsOption1['country'] = key
        datapointsOption2['country'] = key

        datapointsOption1['x'] = xCoordinates[key][2012]
        datapointsOption2['x'] = xCoordinates[key][2014]

        datapointsOption1['y'] = yCoordinates[key][2012]
        datapointsOption2['y'] = yCoordinates[key][2014]

        datapointsOption1['color'] = color[key][2012]
        datapointsOption2['color'] = color[key][2014]

        option1.push(datapointsOption1)
        option2.push(datapointsOption2)
      };
    };

  // Step 4: Append both options to 1 final object
  var data = {}
  data['option1'] = option1
  data['option2'] = option2

  // Return preprocessed data
  return data;
};

function draw(data, year){

  // Determine width, height and margins
  var svgW = 700 // range
  var svgH = 500 // range
  var svgPadding = 50
  var marginLeft = 2 * svgPadding // extra space for y axis
  var marginRight = 3 * svgPadding // extra space for legend
  var marginTop = 2 * svgPadding // extra space for title
  var marginBottom = svgPadding // extra space for x axis
  var dataW = svgW - marginLeft - marginRight
  var dataH = svgH - marginTop - marginBottom
  var circleR = 4;

  // Determine colors: pre-made color combination from Color Brewers
  var colors = [{color:"#99d8c9", label:"Low GDP"}, {color:"#41ae76", label:"Average GDP"}, {color:"#005824", label:"High GDP"}];

  // Determine domains
  var dataValuesY = []
  var dataValuesX = []
  var dataValuesColor = []

  data.forEach(function (element) {
    dataValuesY.push(element.y)
    dataValuesX.push(element.x)
    dataValuesColor.push(element.color)
  });

  var yMaxDomain = d3.max(dataValuesY)
  var xMaxDomain = d3.max(dataValuesX)
  var colorMaxDomain = d3.max(dataValuesColor)
  var colorMinDomain = d3.min(dataValuesColor)
  var colorLow = colorMinDomain + (colorMaxDomain - colorMinDomain) / colors.length
  var colorHigh = colorMinDomain + (colorMaxDomain - colorMinDomain) / colors.length * 2;

  // Determine scales
  var yScale = d3.scaleLinear()
                  .domain([0, yMaxDomain])
                  .range([dataH, 0]);

  var xScale = d3.scaleLinear()
                  .domain([0, xMaxDomain + 3])
                  .range([0, dataW]);

  // Create SVG element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", svgW)
              .attr("height", svgH);

  // Create G element in which the plot will be drawn
  var svgPlot = svg.append("g")
                    .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

  // Bind the data to html elements in the DOM
  var datapoints = svgPlot.selectAll("circle")
                          .data(data)
                          .enter()
                          .append("circle");

  // Draw datapoints
  var datapoints = datapoints.attr("cx", function(d) {
                          return xScale(d.x);
                          })
                        .attr("cy", function(d){
                          return yScale(d.y);
                          })
                        .attr("r", circleR)
                        .attr("fill", function(d){
                          if (d.color < colorLow) {
                            return colors[0].color;
                          }
                          else if (d.color > colorHigh) {
                            return colors[2].color;
                          }
                          else {
                            return colors[1].color;
                          }
                        });

  // Draw and label x axis
  var xAxis = d3.axisBottom(xScale);
  svgPlot.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + dataH + ")")
          .call(xAxis)
        .append("text")
          .attr("x", dataW)
          .attr("y", marginBottom/3*2)
          .style("text-anchor", "end")
          .attr("fill", "currentColor")
          .style("font-size", "12px")
          .text("% Children (0-17) living in areas with problems with crime or violence");

  // Draw and label y axis
  var yAxis = d3.axisLeft(yScale);
  svgPlot.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", 0)
          .attr("y", - marginLeft/3)
          .style("text-anchor", "end")
          .attr("fill", "currentColor")
          .style("font-size", "12px")
          .text("Births per 1000 women aged 15-19");

  // Determine legend variables
  var legendHeight = 50
  var legendWidth = 100
  var legendPadding = 10
  var legendCircleR = 5

  var legend = svgPlot.append("g")
                       .attr("class","legend")
                       .attr("transform","translate(" + (dataW + legendPadding) + ", 0)");

  // Draw legend border
  legend.append("rect")
        .attr("x", -legendPadding)
        .attr("y", -legendPadding)
        .attr("height", legendHeight + legendPadding)
        .attr("width", legendWidth + legendPadding)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", "None");

  // Draw legend dots
  legend.selectAll("dots")
          .data(colors)
          .enter()
          .append("circle")
            .attr("cx", 0)
            .attr("cy", function(d,i){
              return legendHeight/colors.length * i;
              })
            .attr("r", legendCircleR)
            .style("fill", function(d){
              return d.color;
              });

  // Draw legend labels
  legend.selectAll("labels")
        .data(colors)
        .enter()
        .append("text")
          .attr("x", legendWidth/6)
          .attr("y", function(d,i){
            return legendCircleR + legendHeight/colors.length * i;
            })
          .style("fill", function(d){
            return d.color;
            })
          .text(function(d){
            return d.label;
            })
          .style("font-size", "12px")
          .style("text-align", "bottom");

    // Draw title
    svgPlot.append("text")
            .attr("class", "title")
            .attr("x", dataW/2)
            .attr("y", - marginBottom)
            .style("text-anchor", "middle")
            .style("font-size", "24px")
            .text("Measurements in Europe in " + year);
};
