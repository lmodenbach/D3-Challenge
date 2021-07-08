var svgWidth = 800;
var svgHeight = 600;

var margin = {
  top: 70,
  right: 20,
  bottom: 100,
  left: 200
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select(".dynamicChart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

function xScale(data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => +d[chosenXAxis]), //*0.8
        d3.max(data, d => +d[chosenXAxis])]) //*1.2
      .range([0, chartWidth]);
  
    return xLinearScale;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => +d[chosenYAxis]), //* 0.8
        d3.max(data, d => +d[chosenYAxis])]) //* 1.2
      .range([chartHeight, 0]);
  
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  
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

  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels) {

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
  
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      .on("mouseout", function(data) {
        toolTip.hide(data);
    });
  
    return circlesGroup; 
  }

  var chosenXAxis = "poverty";
  var chosenYAxis = "income";

  d3.csv("assets/data/data.csv").then(function(statisticalData, err) {
    if (err) throw err;
  
    statisticalData.forEach(function(data) {
      data.age = +data.age;
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });

    var xLinearScale = xScale(statisticalData, chosenXAxis);
    var yLinearScale = yScale(statisticalData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

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

    var circlesGroup = chartGroup.selectAll("circle")
    .data(statisticalData)
    .enter()
    .append("circle")
    .classed("circle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("opacity", ".60");

    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`);

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


    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 5}, 20)`);

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


    var circlesGroup, circleLabels = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleLabels);


      xLabelsGroup.selectAll("text")
      .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(statisticalData, chosenXAxis);
        xAxis = renderXAxis(xLinearScale, xAxis);
        circlesGroup, circleLabels = renderCircleLayers(circlesGroup, circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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
      if (value !== chosenYAxis) {
        chosenYAxis = value;

        yLinearScale = yScale(statisticalData, chosenYAxis);
        yAxis = renderYAxis(yLinearScale, yAxis);
        circlesGroup, circleLabels = renderCircleLayers(circlesGroup, circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

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
