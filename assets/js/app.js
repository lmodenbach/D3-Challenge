//x axis will be median age, percent lacking healthcare, percent in poverty
//y axis will be median household income, percentage smokes, percent obese
var statisticalData = d3.csv("assets/data/data.csv");

var svgWidth = 900;
var svgHeight = 900;

var margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "income";

function xScale(statisticalData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(statisticalData, d => +d[chosenXAxis]) * 1,
        d3.max(statisticalData, d => +d[chosenXAxis]) * 1])
      .range([0, chartWidth]);
  
    return xLinearScale;
}

function yScale(statisticalData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(statisticalData, d => +d[chosenYAxis]) * 1,
        d3.max(statisticalData, d => +d[chosenYAxis]) * 1])
      .range([chartHeight, 0]);
  
    return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "poverty") {
      label = "Percent In Poverty: ";
    }
    else if (chosenXAxis === "poverty") {
      label = "# of Albums:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }


//console.log(statisticalData);