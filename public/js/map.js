var map = function(svg, overlay) {
  svg = d3.select("#" + svg);

  /*
    D3's albersUsa overlay and projection - USA with Alaska and Hawaii to the south west
  */
  var albersUsa = function() {
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

  /*
    D3's equirectangular projection and overlay - whole world, with or without country borders
  */
  var equirectangular = function() {
    d3.json("/geoJSON/world-50m.json", function(error, world) {
      if (error) throw error;

      var projection = d3.geo.equirectangular();

      var path = d3.geo.path()
          .projection(projection);

      countries = svg.select("g")
        .append("g")
          .attr("id","map_overlay");

      countries.insert("path", ".graticule")
          .datum(topojson.feature(world, world.objects.land))
          .attr("class", "land")
          .attr("d", path);

      // svg.insert("path", ".graticule")
      //     .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      //     .attr("class", "boundary")
      //     .attr("d", path);


      // Send the overlay to the back to catch mouse events
      svg.selectAll("#map_overlay").moveToBack();
    });
  };


  /*
    Call the appropriate projection and overlay functions
  */
  switch(overlay) {
    case "albersUsa":
      albersUsa();
      break;
    case "equirectangular":
      equirectangular();
      break;
  }
};
