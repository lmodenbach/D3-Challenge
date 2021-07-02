//x axis will be median age, percent lacking healthcare, percent in poverty
//y axis will be median household income, percentage smokes, percent obese

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