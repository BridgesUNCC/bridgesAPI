BridgesVisualizer.map_canvas = function(canvas, overlay, map, state) {

  var assignmentContainer = canvas.node().parentNode;

  // get width and height of vis
  width = canvas.attr("width");
  height = canvas.attr("height");

  // get id of canvas
  var id = +canvas.attr("id").substr(6);
  if(!id || isNaN(id)) id = 0;


  /*
    D3's albersUsa overlay and projection - USA with Alaska and Hawaii to the south west
  */
  var albersUsa = function() {
      d3.json("/geoJSON/us-10m.v1.json")
	  .then(us => {
	      d3.select(assignmentContainer).selectAll(".map_overlay").remove();
	      vis = d3.select(assignmentContainer)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);
	      
	      vis
		  .attr("id", "map_overlay_svg_" + id)
		  .attr("class", "map_overlay_svg");
	      
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
	  })
	  .catch (error => {
	      console.log(error);
	  });
  };

  /*
    D3's equirectangular projection and overlay - whole world, with or without country borders
  */
  var equirectangular = function() {
      d3.json("/geoJSON/world-50m.json")
	  .then(world => {

	      d3.select(assignmentContainer).selectAll(".map_overlay").remove();
	      vis = d3.select(assignmentContainer)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

	      vis
		  .attr("id", "map_overlay_svg_" + id)
		  .attr("class", "map_overlay_svg");
	      
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

	      // Send the overlay to the back to catch mouse events
	      vis.select("g").select("#map_overlay"+id).moveToBack();
	      vis.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));

	      // update the transformation based on the sibling transform
	      vis.zoom = function(d) {
		  d3.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));
	      };

	      // register the map with the sibling for transformation
	      canvas.registerMapOverlay(vis);
	  })
	  .catch(error => {
	      console.log(error);
	  });
  };


  //parse the svg file as xml and get the path tag based on the state selected and render in d3
  var svgMap = function(){

      d3.json("/assets/states-10m.json")
	  .then(us => {

	      d3.select(assignmentContainer).selectAll(".map_overlay").remove();
	      vis = d3.select(assignmentContainer)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

	      vis
		  .attr("id", "map_overlay_svg_" + id)
		  .attr("class", "map_overlay_svg");

	      path = d3.geoPath();

	      var projection = d3.geoAlbersUsa();

	      var path = d3.geoPath().projection(projection);

	      states = vis.append("g")
		  .attr("id","map_overlay"+id)
		  .classed("map_overlay", true)
	      
              var array = topojson.feature(us, us.objects.states).features
              var arraycopy = [...array];
    
              var countiesArray = topojson.feature(us, us.objects.counties).features
              var countiesArraycopy = [...countiesArray];
    
              //TODO: Optimize
              if(state[0].state_name.toLowerCase() == "all"){
		  var visData = arraycopy
              }else{
		  var visData = arraycopy.filter(function(d) { 
		      for(let i = 0; i < state.length; i++){
			  if(d.properties.name.toLowerCase() == state[i]._state_name.toLowerCase()){
			      d.properties.stroke_color = state[i]._stroke_color
			      d.properties.fill_color = state[i]._fill_color
			      d.properties.stroke_width = state[i]._stroke_width
			      return true
			  }
		      }
		      return false
		  })
		  var countiesvisdata = countiesArraycopy.filter(function(d){
		      for(let i = 0; i < state.length; i++){
			  if(state[i]._view_counties == true){
			      for(let j = 0; j < state[i]._counties.length; j++){
				  if(d.id == state[i]._counties[j]._geoid 
				     && state[i]._counties[j]._hide !== true){
				      d.properties.stroke_color = state[i]._counties[j]._stroke_color
				      d.properties.fill_color = state[i]._counties[j]._fill_color
				      d.properties.stroke_width = state[i]._counties[j]._stroke_width
				      return true
				  }
			      }
			  }       
		      }
		      return false
		  })
		  visData = visData.concat(countiesvisdata)
		  console.log(visData)
              }
	      
              states.selectAll("path")
		  .attr("class", "land")
		  .attr("id", "state_fips")
		  .data(visData)
		  .enter()
		  .append("path")
		  .attr("fill", function(d){return BridgesVisualizer.getColor(d.properties.fill_color)})
		  .attr("d", path)
		  .attr("stroke",function(d){return BridgesVisualizer.getColor(d.properties.stroke_color)})
		  .attr("stroke-width", function(d){return d.properties.stroke_width})

	      // var mySVG = document.getElementById("map_overlay_svg_" + id);

	      // let bbox = document.getElementById("map_overlay"+id).getBBox();

	      // mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);
	      // document.getElementsByTagName('g')[0].setAttribute("transform", "translate(" + 0 + "," + 0 + ")");

	      // vis.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));

	      // update the transformation based on the sibling transform
	      vis.zoom = function(d) {
		  d3.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));
	      };

	      vis.select("g").select("#map_overlay"+id).moveToBack();
	      canvas.registerMapOverlay(vis);
	  })
	  .catch(error => {
	      console.log(error)
	  });
  }

  var svgWorldMap = function(){
      d3.json("/assets/world_countries.json")
	  .then( us => {
	      d3.select(assignmentContainer).selectAll(".map_overlay").remove();
	      vis = d3.select(assignmentContainer)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

	      vis
		  .attr("id", "map_overlay_svg_" + id)
		  .attr("class", "map_overlay_svg");
	      
	      path = d3.geoPath();
	      
	      var projection = d3.geoEquirectangular();
	      
	      var path = d3.geoPath()
		  .projection(projection);
	      
	      states = vis.append("g")
		  .attr("id","map_overlay"+id)
		  .classed("map_overlay", true)
	      
	      var array = topojson.feature(us, us.objects.countries).features
	      var arraycopy = [...array];
	      if(state.toLowerCase() == "all"){
		  var visData = arraycopy
	      }else{
		  var visData = arraycopy.filter(function(d) { return d.properties.name.toLowerCase() == state.toLowerCase(); })
	      }
	      
	      states.selectAll("path")
		  .attr("class", "land")
		  .attr("id", "state_fips")
		  .data(visData)
		  .enter()
		  .append("path")
		  .attr("fill", 'rgba(0.0, 0.0, 0.0, 0.08)')
		  .attr("d", path)
		  .attr("stroke","blue")
		  .attr("stroke-width", 0.5)
	      
	      // var mySVG = document.getElementById("map_overlay"+id);
	      
	      // let bbox = document.getElementById("map_overlay"+id).getBBox();
	      
	      // // mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);
	      // // document.getElementsByTagName('g')[0].setAttribute("transform", "translate(" + 0 + "," + 0 + ")");
	      
	      // vis.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));
	      
	      // update the transformation based on the sibling transform
	      vis.zoom = function(d) {
		  d3.select("#map_overlay"+id).attr("transform", d3.zoomTransform(canvas.node()));
	      };
	      
	      vis.select("g").select("#map_overlay"+id).moveToBack();
	      canvas.registerMapOverlay(vis);
	  })
	  .catch(error => {
	      console.log(error);
	  });
  }


  /*
    Call the appropriate projection and overlay functions
  */
  switch(map.toLowerCase()) {
    case "world":
      svgWorldMap();
      break;
    case "us":
      svgMap();
      break;
    case "equirectangularOld":
      equirectangular();
      break;
  }
};
