var map = function(svg) {

  var svg = d3.select("#" + svg);
  d3.json("/geoJSON/us-10m.v1.json", function(error, us) {
    if (error) throw error;
    var states = svg.select("g")
      .append("g")
        .attr("id","map_overlay")
      .selectAll("states")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().insert("path", ".graticule")
                .attr("class", "states")
                .attr("d", d3.geo.path())
                .on('mouseover', function(d) {
                  d3.select(this).style('opacity', 0.3);
                  console.log(d);
                })
                .on('mouseout', function(d) {
                  d3.select(this).style('opacity', 1);
                });

    // Send the overlay to the back to catch mouse events
    svg.select("g").selectAll("#map_overlay").moveToBack();
  });
};
