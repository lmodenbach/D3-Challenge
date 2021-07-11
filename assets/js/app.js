//import statistical functions
import { linearRegression, linearRegressionLine } from './simpleStatistics.js';

//set svg and chart dimensions and margins 
var svgWidth = 1000;
var svgHeight = 675;

var margin = {
  top: 15,
  right: 15,
  bottom: 115,
  left: 150
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

//add svg to page
var svg = d3
  .select(".dynamicChart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//add chartgroup "g" to svg, translate out of the margins  
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//take in data and a column argument based on chosen axis, calculate domain, set range, return
//linear scale 
function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => +d[chosenXAxis]), //*0.8
        d3.max(data, d => +d[chosenXAxis])]) //*1.2
      .range([0, chartWidth]);
  
    return xLinearScale;
}

//take in data and a column argument based on chosen axis, calculate domain, set range, return
//linear scale
function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => +d[chosenYAxis]), //* 0.8
        d3.max(data, d => +d[chosenYAxis])]) //* 1.2
      .range([chartHeight, 0]);
  
    return yLinearScale;
}

//take in axis object and new linear scale, transform axis over span of 1 second
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  //take in axis object and new linear scale, transform axis over span of 1 second
  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  //double duty function, takes in old circle group and labels and transforms their data over span
  //of 1 second using the new column specs and new linear scales, returns new circles group and labels 
  function renderCircleLayers(circlesGroup, circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    circleLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]) - 7)
      .attr("y", d => newYScale(d[chosenYAxis]) + 3);
  
    return circlesGroup, circleLabels;
  }

  //update tooltip data using new column designations with old circles group, return new circles group
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
  
    if (chosenXAxis === "poverty") {
      xLabel = "Percent In Poverty: ";
    }
    else if (chosenXAxis === "healthcare") {
      xLabel = "Percent Lacking Healthcare: ";
    }
    else if (chosenXAxis === "age") {
      xLabel = "Median Age: "; 
    }


    var yLabel;
  
    if (chosenYAxis === "income") {
      yLabel = "Median Income: ";
    }
    else if (chosenYAxis === "smokes") {
      yLabel = "Percent Smokers: ";
    }
    else if (chosenYAxis === "obesity") {
      yLabel = "Percent Obese: "; 
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .attr("class", "d3-tip")
      .html(function(d) {
        return (`${d.state}<br>${xLabel}${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}`);
      });
  
    //add tooltip to circles group
    circlesGroup.call(toolTip);

    //listener for circles to activate/deactivate tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      .on("mouseout", function(data) {
        toolTip.hide(data);
    });
  
    return circlesGroup; 
  }

  //initialize axes
  var chosenXAxis = "poverty";
  var chosenYAxis = "income";

  //read in data csv, catch any error
  d3.csv("assets/data/data.csv").then(function(statisticalData, err) {
    if (err) throw err;
  
  //transform data to numeric form
    statisticalData.forEach(function(data) {
      data.age = +data.age;
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });

  //intitalize linear scales
    var xLinearScale = xScale(statisticalData, chosenXAxis);
    var yLinearScale = yScale(statisticalData, chosenYAxis);

  //create axes from linear scales
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
   //add axes to chartgroup, drop x-axis to bottom of page 
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    //attempting a regression line here........
    var regressArray = statisticalData.map(d => [d[chosenXAxis], d[chosenYAxis]]);
    var regressFunction = linearRegressionLine(linearRegression(regressArray));

    var regressLine = chartGroup.selectAll("g")
      .data(statisticalData)
      .enter()
      .append("path")
      .classed("rLine", true)
      .attr("d", d3.line(d => [d[chosenXAxis], regressFunction(d[chosenXAxis])]));
  //.........section above under construction      

  //add state abbreviations to chartgroup where corresponding circles will be, center them on
  //circles' centers
    var circleLabels = chartGroup.selectAll(null)
    .data(statisticalData)
    .enter()
    .append("text")
    .classed("circle-text", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]) - 7)
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 3)
    .attr("font-size", 9)
    .attr("text-anchor", "center")
    .text(d => d.abbr);

  //add circles to chartgroup, leave slightly translucent so labels show through, center coordinates
  //based on each data point from specified column passed to the linear scale  
    var circlesGroup = chartGroup.selectAll("circle")
    .data(statisticalData)
    .enter()
    .append("circle")
    .classed("circle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("opacity", ".60");

   //create axis label groups and labels, place on chart using dimensions, class so that css 
  //distinguishes current axis from unselected ones 
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 30})`);

    var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("Percent of Population Facing Poverty");

    var healthcareLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Percent of Population Lacking Healthcare");

    var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") 
    .classed("inactive", true)
    .text("Median Age of Population");

  //create axis label groups and labels, place on chart using dimensions, class so that css 
  //distinguishes current axis from unselected ones
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(70, 10)`);

    var incomeLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "income") 
    .classed("active", true)
    .classed("axis-text", true)
    .text("Population Median Income");

    var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 20)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "smokes") 
    .classed("inactive", true)
    .classed("axis-text", true)
    .text("Percent of Population Who Smokes");

    var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 40)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "obesity") 
    .classed("inactive", true)
    .classed("axis-text", true)
    .text("Percentage of Population Facing Obesity");

    //initialize tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    //axis listener functions

      xLabelsGroup.selectAll("text")
      .on("click", function() {
      var value = d3.select(this).attr("value");
      
      //update axis value
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        
        //update linear scale, axis, circles/tooltips/labels from user choice of axis label
        xLinearScale = xScale(statisticalData, chosenXAxis);
        xAxis = renderXAxis(xLinearScale, xAxis);
        circlesGroup, circleLabels = renderCircleLayers(circlesGroup, circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //make sure css is distinguishing active/inactive axes
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("inactive", true)
            .classed("active", false);  
          ageLabel
            .classed("inactive", true)
            .classed("active", false);  
        }
        else if (chosenXAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("inactive", true)
            .classed("active", false);
          povertyLabel
            .classed("inactive", true)
            .classed("active", false);
        }
        else if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("inactive", true)
            .classed("active", false);
          healthcareLabel
            .classed("inactive", true)
            .classed("active", false);
        }
      }
    });  

      yLabelsGroup.selectAll("text")
      .on("click", function() {
      var value = d3.select(this).attr("value");
      
      //update axis value
      if (value !== chosenYAxis) {
        chosenYAxis = value;

        //update linear scale, axis, circles/tooltips/labels from user choice of axis label
        yLinearScale = yScale(statisticalData, chosenYAxis);
        yAxis = renderYAxis(yLinearScale, yAxis);
        circlesGroup, circleLabels = renderCircleLayers(circlesGroup, circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //make sure css is distinguishing active/inactive axes
        if (chosenYAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("inactive", true)
            .classed("active", false);
          obesityLabel
            .classed("inactive", true)
            .classed("active", false);
        }
        else if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("inactive", true)
            .classed("active", false);
          incomeLabel
            .classed("inactive", true)
            .classed("active", false);
        }
        else if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("inactive", true)
            .classed("active", false);
          smokesLabel
            .classed("inactive", true)
            .classed("active", false);
        }
      }

  });  

});
