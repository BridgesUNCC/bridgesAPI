BridgesVisualizer.map_canvas = function(canvas, overlay) {

  var assignmentContainer = canvas.node().parentNode;

  // get width and height of vis
  width = canvas.attr("width");
  height = canvas.attr("height");

  // get id of canvas
  var id = +canvas.attr("id").substr(6);
  if(!id || isNaN(id)) id = 0;

  vis = d3.select(assignmentContainer)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

  vis
    .attr("id", "map_overlay_svg_" + id)
    .attr("class", "map_overlay_svg");

  /*
    D3's albersUsa overlay and projection - USA with Alaska and Hawaii to the south west
  */
  var albersUsa = function() {
    d3.json("/geoJSON/us-10m.v1.json", function(error, us) {
      if (error) throw error;
      path = d3.geoPath();

      var projection = d3.geoAlbersUsa();

      var path = d3.geoPath()
          .projection(projection);

      states = vis.append("g")
          .attr("id","map_overlay"+id)
          .classed("map_overlay", true);

      states.insert("path", ".graticule")
          .datum(topojson.feature(us, us.objects.states))
          .attr("class", "land")
          .attr("d", path);

      // Send the overlay to the back to catch mouse events
      vis.select("g").select("#map_overlay"+id).moveToBack();
      vis.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));

      // update the transformation based on the sibling transform
      vis.zoom = function(d) {
        d3.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));
      };

      // register the map with the sibling for transformation
      canvas.registerMapOverlay(vis);
    });
  };

  /*
    D3's equirectangular projection and overlay - whole world, with or without country borders
  */
  var equirectangular = function() {
    d3.json("/geoJSON/world-50m.json", function(error, world) {
      if (error) throw error;

      var projection = d3.geoEquirectangular();

      var path = d3.geoPath()
          .projection(projection);

      countries = vis.append("g")
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
      vis.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));

      // update the transformation based on the sibling transform
      vis.zoom = function(d) {
        d3.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));
      };

      // register the map with the sibling for transformation
      canvas.registerMapOverlay(vis);
    });
  };


  /*
    Call the appropriate projection and overlay functions
  */
  switch(overlay) {
    case "albersusa":
      albersUsa();
      break;
    case "equirectangular":
      equirectangular();
      break;
  }
};
