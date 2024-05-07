// Wait for the DOM to fully load before executing the script
document.addEventListener("DOMContentLoaded", function () {
  // Select the SVG element and set its dimensions
  const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 20, right: 20, bottom: 40, left: 50 };

  // x-axis scale definition
  const x = d3.scaleLinear().range([margin.left, width - margin.right]);

  // y-axis scale definition
  const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  // x-axis formatting and positioning Configuration
  const xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".2s")));

  // y-axis Configuration with custom tick format and dynamic values
  const yAxis = (g) =>
    g.attr("transform", `translate(${margin.left},0)`).call(
      d3
        .axisLeft(y)
        .tickFormat(d3.format(".4s"))
        .tickValues(d3.range(8.25, 13, 0.25))
        .tickSize(-width + margin.left + margin.right)
    );

  // Tooltip div that is initially invisible
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  // Load data from CSV file
  d3.csv("dataset.csv").then((data) => {
    // Parse each data entry converting string to numbers
    data.forEach((d) => {
      d.Population = +d.Population;
      d["1980s"] = +d["1980s"];
      d["1990s"] = +d["1990s"];
      d["2000s"] = +d["2000s"];
      d["2010s"] = +d["2010s"];
      d["2020s"] = +d["2020s"];
      d["OverallAverage"] = +d["Overall Average"];
      d["OverallAverage1980sTo2010s"] = +d["Overall Average (1980s - 2010s)"];

    //   console.log(d); 
    });

    // Define color coding for different decades
    const colorMapping = {
      "1980s": "#FF5733",
      "1990s": "#33FF57",
      "2000s": "#3357FF",
      "2010s": "#FF33F6",
      "2020s": "#d3aa33",
      OverallAverage: "#00ffff",
      OverallAverage1980sTo2010s: "#00aaff",
    };

    // Function to update the graph based on selected decade
    const update = (decade) => {
      y.domain([8.25, 13]).nice();
      x.domain([0, d3.max(data, (d) => d.Population)]).nice();

      // Update the graph points
      const u = svg
        .selectAll(".point")
        .data(data)
        .join("circle")
        .attr("class", "point")
        .attr("cx", (d) => x(d.Population))
        .attr("cy", (d) => y(d[decade]))
        .attr("r", 7) // Circle size
        .style("fill", colorMapping[decade]) // Circle color
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip
            .html("City: " + d.City + "<br/>Weather: " + d[decade])
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function (d) {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Removing existing y-axis and re-add for updates
      svg.selectAll(".y-axis").remove();
      svg.append("g").attr("class", "y-axis").call(yAxis);

      // x-axis label
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height - margin.top + 15)
        .text("Population");

      // y-axis label
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 35)
        .attr("x", -margin.top - height / 2 + 150)
        .text("Average Decade Temperature (°C)");
    };

    // Event listeners to radio buttons for changing decades
    document.querySelectorAll('input[name="decade"]').forEach((radio) => {
      radio.addEventListener("change", function () {
        update(this.value);
      });
    });

    // Initial default graph update
    update(document.querySelector('input[name="decade"]:checked').value);

    // Initial graph configuration
    update("OverallAverage");
    svg.append("g").call(xAxis);
  });
});
