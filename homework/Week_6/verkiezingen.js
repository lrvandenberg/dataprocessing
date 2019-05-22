/*
Name: Lotte van den Berg
Student number: 12427241
This file creates a barchart and piechart using D3.
Tooltip code sampled from (with adjustions): https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
Transition pie chart sampled from (with adjustions): https://www.d3-graph-gallery.com/graph/pie_changeData.html
*/

// Add tooltip container for bar chart and pie chart
d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("display", "none")
  .style("min-width", "50px")
  .style("height", "20px")
  .style("background", "white")
  .style("border", "1px solid green")
  .style("padding", "5px")
  .style("text-align", "center");

window.onload = function() {

  // Load in json files
  var requests = [d3.json("GR_LeidenStemmen.json"), d3.json("GR_LeidenWijken.json")];

  // Make sure all files are loaded
  Promise.all(requests).then(function(response) {

    // Preprocess the data
    var preprocessed = preprocess(response[0], response[1].data);
    var votes = preprocessed[0];
    var districts = preprocessed[1];

    // Draw barchart of votes, returns the bar elements
    var drawnBars = draw_barchart(votes);

    // Draw piechart frame of districts, returns radius and colorScale
    var pieInfo = draw_piechart_frame(districts['CDA']); // use CDA as a random starter (could have been any other party)

    // Initialize piechart with first update
    var firstUpdate = true;
    update_piechart(districts['CDA'], pieInfo, votes[0].partij, votes[0].stemmen, firstUpdate);

    // When clicked on a bar, update piechart
    drawnBars.on("click", function(d){
      update_piechart(districts[d.partij], pieInfo, d.partij, d.stemmen, firstUpdate=false)});

    })

  // Handle errors
  .catch(function(e){throw(e)});

};


function preprocess(dataVotes, dataDistricts) {

  // Preprocess dataVotes
  var cleanedVotes = []
  for (key in dataVotes) {
    cleanedVotes.push({'partij': key, 'stemmen': dataVotes[key].stemmen})};

  // Preprocess dataDistricts
  var cleanedDistricts = {}
  for (key in dataVotes) {

    var wijken = []
    dataDistricts.forEach(function (element) {

      if (element.partij == key) {
        var wijk = {}
        wijk['wijk'] = element.w
        wijk['stemmen'] = element.stemmen
        wijken.push(wijk)
      };

    });

    cleanedDistricts[key] = wijken
  };

  return [cleanedVotes, cleanedDistricts]
};


function draw_barchart(data) {

  // Determine width, height and padding
  var svgW = 550
  var svgH = 500
  var margin = {left:100, right: 0, top:100, bottom:50}
  var dataW = svgW - margin.left - margin.right// extra space for axis labels
  var dataH = svgH - margin.top - margin.bottom // extra space for title and axis labels
  var barPadding = 0.1

  // Determine domains
  var dataKeys = []
  var dataValues = []
  data.forEach(function (element) {
    dataKeys.push(element.partij)
    dataValues.push(element.stemmen)
  });
  var yMaxDomain = d3.max(dataValues);

  // Determine scales
  var yScale = d3.scaleLinear()
                  .domain([0, yMaxDomain])
                  .range([dataH, 0]);

  var xScale = d3.scaleBand()
                  .domain(dataKeys)
                  .range([0, dataW])
                  .padding(barPadding);

  // Create SVG element
  var svg = d3.select("#barchart_area")
              .append("svg")
                .attr("width", svgW)
                .attr("height", svgH);

  // Create G element in which the bars will be written
  var svgBar = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Draw and label x axis
  var xAxis = d3.axisBottom(xScale);
  svgBar.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + dataH + ")")
          .call(xAxis)
        .append("text")
          .attr("x", dataW)
          .attr("y", margin.bottom/3*2)
          .style("text-anchor", "end")
          .attr("fill", "currentColor")
          .style("font-size", "12px")
          .text("Partijen");

  // Draw and label y axis
  var yAxis = d3.axisLeft(yScale);
  svgBar.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", 0)
          .attr("y", - margin.bottom)
          .style("text-anchor", "end")
          .attr("fill", "currentColor")
          .style("font-size", "12px")
          .text("Stemmen");

  // Draw title
  svgBar.append("text")
          .attr("class", "title")
          .attr("x", dataW/2)
          .attr("y", - margin.top/2)
          .style("text-anchor", "middle")
          .style("font-size", "24px")
          .text("Gemeenteraadsverkiezingen Leiden 2018");

  // Bind the dataset to html elements in the DOM
  var bars = svgBar.selectAll("rect")
                    .data(data)
                    .enter()
                    .append("rect");

  // Create bars
  var bars = bars.attr("x", function(d) {
                    return xScale(d.partij);})
                  .attr("y", function(d) {
                    return yScale(d.stemmen);})
                  .attr("width", function(d) {
                    return xScale.bandwidth();})
                  .attr("height", function(d) {
                    return (dataH - yScale(d.stemmen));})
                  .attr("fill", "green")

  // Tooltip
  var bars = bars.on("mouseover", function(d) {
                    d3.select(this).attr("fill", "greenyellow");
                    d3.selectAll(".tooltip").style("left", d3.event.pageX - 50 + "px")
                                            .style("top", d3.event.pageY - 50 + "px")
                                            .style("display", "inline-block")
                                            .html((d.partij) + ": " + (d.stemmen));
                    })
                  .on("mouseout", function() {
                    d3.select(this).attr("fill", "green");
                    d3.selectAll(".tooltip").style("display", "none");
                    })

  // Return bars for later use in piechart function
  return bars;
};


function draw_piechart_frame(data) {

  // Determine width, height and padding
  var svgW = 750
  var svgH = 500
  var margin = {left:100, right: 200, top:100, bottom:0} // extra space for legend and title
  var dataW = svgW - margin.left - margin.right
  var dataH = svgH - margin.top - margin.bottom
  var radius = Math.min(dataW, dataH) / 2;

  // Create SVG element
  var svg = d3.select("#piechart_area")
              .append("svg")
                .attr("width", svgW)
                .attr("height", svgH);

  // Create G element in which the pie will be written
  var svgPie = svg.append("g")
                    .attr("class", "svgPie")
                    .attr("transform", "translate(" + (margin.left + dataW/2) + "," + (margin.top + dataH/2) + ")");

  // Draw title frame (actual text will be updated)
  svg.append("text")
        .attr("class", "titlePie")
        .attr("x", margin.left + dataW/2)
        .attr("y", margin.top/2)
        .style("text-anchor", "middle")
        .style("font-size", "24px");

  // Determine keys for color scale
  var dataKeys = []
  data.forEach(function (element) {
      dataKeys.push(element.wijk)});

  // Determine color scale
  var colorScale = d3.scaleOrdinal()
                      .domain(dataKeys)
                      .range(d3.schemePaired);

  // Determine legend variables
  var legendHeight = 200
  var legendWidth = margin.right
  var legendPadding = 10
  var legendCircleR = 5

  // Create G-area to draw the legend
  var legend = svg.append("g")
                    .attr("class","legend")
                    .attr("transform","translate(" + (dataW + margin.left) + "," + margin.top + ")");

  // Draw legend dots
  legend.selectAll("dots")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", 0)
          .attr("cy", function(d, i) {
            return legendHeight/data.length * i;})
          .attr("r", legendCircleR)
          .style("fill", function(d) {
            return colorScale(d.wijk);});

  // District names derived from official clarification of the dataset (data.overheid.nl)
  var districtNames = {0:"Binnenstad-Zuid", 1:"Binnenstad-Noord", 2:"Stationsdistrict", 3:"Leiden-Noord", 4:"Roodenburg", 5:"Bos- en Gasthuis", 6:"de Mors", 7:"Boerhaave", 8:"Merenwijk", 9:"Stevenshof", 99:"Overig"}

  // Draw legend labels
  legend.selectAll("labels")
        .data(data)
        .enter()
        .append("text")
          .attr("x", legendPadding)
          .attr("y", function(d, i) {
              return legendCircleR + legendHeight/data.length * i;})
          .style("fill", "black")
          .text(function(d) {
              return districtNames[d.wijk];})
          .style("font-size", "12px")
          .style("text-align", "bottom");

  // Return radius and color scale for later usage in updates
  return [radius, colorScale]
};


function update_piechart(data, pieInfo, partijNaam, stemmenTotaal, firstUpdate) {

  var radius = pieInfo[0]
  var colorScale = pieInfo[1]

  // Update title
  d3.selectAll(".titlePie")
      .text("Verdeling stemmen over wijken: " + partijNaam + " (" + stemmenTotaal + ")");

  // Function for determining size of the pies
  var pie = d3.pie()
              .value(function(d) {
                return d.stemmen })
              .sort(null);

  // Bind data to the pie elements
  var pieParts = d3.selectAll(".svgPie")
                .selectAll("path")
                .data(pie(data));

  // Append path elements
  var path = pieParts.enter()
                      .append('path');

  // Visualize (and update) pieparts
  var pathDrawn = path
                .merge(pieParts)
                .transition()
                .duration(1000)
                .attr('d', d3.arc()
                              .innerRadius(0)
                              .outerRadius(radius))
                .attr('fill', function(d) {
                  return colorScale(d.data.wijk);})
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .style("opacity", 1);

 // Remove parts that don't exist
 path.exit()
      .remove();

  // Tooltip
  if (firstUpdate) {

    path.on("mouseover", function(d) {
              d3.selectAll(".tooltip")
                  .style("left", d3.event.pageX - 40 + "px")
                  .style("top", d3.event.pageY - 40 + "px")
                  .style("display", "inline-block")
                  .html("Stemmen: " + d.data.stemmen + " (" + Math.round(d.data.stemmen * 100/stemmenTotaal) + "%)");})
          .on("mouseout", function() {
              d3.selectAll(".tooltip").style("display", "none");})

  }
  else {

    pieParts.on("mouseover", function(d)  {
                d3.selectAll(".tooltip")
                    .style("left", d3.event.pageX - 40 + "px")
                    .style("top", d3.event.pageY - 40 + "px")
                    .style("display", "inline-block")
                    .html("Stemmen: " + d.data.stemmen + " (" + Math.round(d.data.stemmen * 100/stemmenTotaal) + "%)");})
              .on("mouseout", function() {
                d3.selectAll(".tooltip").style("display", "none")})

  }

};
