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





//console.log(statisticalData);