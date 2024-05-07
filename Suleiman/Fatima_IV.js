// Set the dimensions and margins of the graph
const margin = {
  top: 165,
  right: 260,
  bottom: 150,
  left: 40 // Adjusted left margin to accommodate the y-axis labels
};
const width = 1150 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3.select('.row')
  .select('.column1')
  .select(".card")
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Read the data
d3.json("data.json").then((data) => {

  // Add chart title
  svg.append("text")
    .classed('title', true)
    .attr("x", width / 2)
    .attr("y", - 100)
    .attr("text-anchor", "middle")
    .text("Average Temperature Trends Across 7 Cities in United Kingdom for 4 decades");

  // Set up the y-axis
  const maxY = d3.max(data, d => d3.max([d.London, d.Birmingham, d.Manchester, d.Leeds, d.Sheffield, d.Glasgow, d.Cardiff]));
  const yScale = d3.scaleLinear()
    .domain([0, maxY])
    .range([height, 0]);
  const yAxis = d3.axisLeft(yScale)
    .ticks(10)
    .tickSizeOuter(0);
  svg.append("g")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50) // Adjusted y position to leave space for the title
    .attr("x", -height / 2)
    .attr("dy", "0.71em")
    .attr("text-anchor", "middle")
    .text("Temperature (°C)"); // Changed the text to represent temperature

    // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "0.71em")
    .style("text-anchor", "middle")
    .text("Temperature (°C)");

  // Set up the x-axis
  const maxX = d3.max(data, d => d.Year);
  const xScale = d3.scaleLinear()
    .domain([1980, maxX])
    .range([0, width]);
  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickSizeOuter(0)
    .tickFormat(d3.format("d"));
  svg.append("g")
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .append("text")
    .attr("x", width / 2)
    .attr("y", - 50)
    .attr("text-anchor", "middle")
    .text("Years"); // Changed the text to represent years

   
  // Add x-axis label
  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top - 100})`)
    .style("text-anchor", "middle")
    .text("Years"); 

    

  // Draw stacked bars
  const stack = d3.stack()
    .keys(["London", "Birmingham", "Manchester", "Leeds", "Sheffield", "Glasgow", "Cardiff"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const stackedData = stack(data);

  // Set up x and y scales for the bars
  const x = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
    .range([height, 0]);

  // Color scale for cities
  const color = d3.scaleOrdinal()
    .domain(["London", "Birmingham", "Manchester", "Leeds", "Sheffield", "Glasgow", "Cardiff"])
    .range(d3.schemeCategory10);

  // Append legend
  const legend = svg.selectAll(".legend")
  .data(color.domain())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) {
    return "translate(0," + i * 20 + ")";
  })
  .on("click", function(d) {
    const selected = d3.select(this);
    const city = selected.attr("data-city");
    const display = selected.attr("data-display");
    const newDisplay = display === "true" ? "false" : "true";

    selected.attr("data-display", newDisplay);

    // Toggle visibility of corresponding data series
    svg.selectAll("." + city)
      .style("display", newDisplay === "true" ? "block" : "none");
  });

// Add colored squares to legend
legend.append("rect")
  .attr("x", width + 20)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color)
  .attr("data-city", d => d)
  .attr("data-display", "true");

// Add city names to legend
  legend.append("text")
    .attr("x", width + 45)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d) {
      return d;
    });  

  // Tooltip setup
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("font-size", "30px"); // Increased font size here

  // Draw stacked bars
  svg.selectAll(".serie")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => x(d.data.Year))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
      const city = d3.select(this.parentNode).datum().key; // Get the city name
      const temperature = d.data[city]; // Get the temperature for the city
      const year = d.data.Year; // Get the year for the city
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html("City: " + city + "<br/>Temperature: " + temperature + "°C<br/>Year: " + year) // Added year to the tooltip
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

}).catch(error => {
  console.error("An error occurred:", error);
});