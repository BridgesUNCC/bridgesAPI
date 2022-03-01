BridgesVisualizer.map = function(vis, overlay, map) {

  // get id of svg
  var id = +vis.attr("id").substr(3);
  if(!id || isNaN(id)) id = 0;

  console.log(map)
  /*
    D3's albersUsa overlay and projection - USA with Alaska and Hawaii to the south west
  */
  var albersUsa = function() {
    d3.json("/geoJSON/us-10m.v1.json", function(error, us) {
      if (error) throw error;

      d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

      path = d3.geoPath();

      var projection = d3.geoAlbersUsa();

      var path = d3.geoPath()
          .projection(projection);

      states = vis.select("g")
        .append("g")
          .attr("id","map_overlay"+id)
          .classed("map_overlay", true);

      states.insert("path", ".graticule")
          .datum(topojson.feature(us, us.objects.states))
          .attr("class", "land")
          .attr("d", path);

      console.log(us.objects.states)

      // Send the overlay to the back to catch mouse events
      vis.select("g").select("#map_overlay"+id).moveToBack();
    });
  };

  /*
    D3's equirectangular projection and overlay - whole world, with or without country borders
  */
  var equirectangular = function() {
    d3.json("/geoJSON/world-50m.json", function(error, world) {
      if (error) throw error;

      d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

      var projection = d3.geoEquirectangular();

      var path = d3.geoPath()
          .projection(projection);

      countries = vis.select("g")
        .append("g")
          .attr("id","map_overlay"+id)
          .classed("map_overlay", true);
      countries.insert("path", ".graticule")
          .datum(topojson.feature(world, world.objects.land))
          .attr("class", "land")
          .attr("d", path);

      // svg.insert("path", ".graticule")
      //     .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      //     .attr("class", "boundary")
      //     .attr("d", path);


      // Send the overlay to the back to catch mouse events
      vis.select("g").select("#map_overlay"+id).moveToBack();
    });
  };

  //parse the svg file as xml and get the path tag based on the state selected and render in d3
  var svgMap = function(){

    d3.json("/assets/us-albers-counties.json", function(error, us) {
      if (error) throw error;

      d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

      path = d3.geoPath();

      var projection = d3.geoAlbersUsa();

      var path = d3.geoPath()
          .projection(projection);

      states = vis.select("g")
        .append("g")
          .attr("id","map_overlay"+id)
          .classed("map_overlay", true)


      var array = topojson.feature(us, us.objects.collection).features
      var arraycopy = [...array];

      states.selectAll("path")
          .attr("class", "land")
          .attr("id", "state_fips")
          .data(arraycopy.filter(function(d) { return d.properties.state.toLowerCase() == map.toLowerCase(); }))
          .enter()
          .append("path")
          // .attr("fill", "black")
          .attr("d", path)
          // .attr("stroke","green")
          // .attr("strokeWidth", 20)


      console.log(us.objects.states)


      vis.select("g").select("#map_overlay"+id).moveToBack();

    })
  }


  /*
    Call the appropriate projection and overlay functions
  */
  switch(overlay) {
    case "albersusa":
      //albersUsa();
      svgMap();
      break;
    case "equirectangular":
      equirectangular();
      //svgMap();
      break;
  }
};
