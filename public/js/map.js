BridgesVisualizer.map = function(vis, overlay, map_projection, state) {

	// Input Params:
	// 		vis - root node at which the map document is created
	//		overlay - is this being used?
	//		map_projection - projection parameter for the map
	// 		state - array of US states or Country names. if state =="all", 
	// 			it refers to all states or all countries 

	// get id of svg -- to identify sub assignments



	var id = +vis.attr("id").substr(3);
	if (!id || isNaN(id))
		id = 0;

	// D3's albersUsa overlay and projection - USA with Alaska and Hawaii 
	// to the south west
	// NOTE: This function is not currently used (see the bottom of this file 
	// with the switch statement to see the functions being used in the current
	// version
	var albersUsa = function() {
		d3.json("/geoJSON/us-10m.v1.json")
		.then( us => {

			d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

			path = d3.geoPath();

			var projection = d3.geoAlbersUsa();

			var path = d3.geoPath()
				.projection(projection);

			states = vis.select("g")
				.append("g")
				.attr("id", "map_overlay" + id)
				.classed("map_overlay", true);

			states.insert("path", ".graticule")
			.datum(topojson.feature(us, us.objects.states))
			.attr("class", "land")
			.attr("d", path);

			// Send the overlay to the back to catch mouse events
			vis.select("g").select("#map_overlay" + id).moveToBack();
		})
		.catch(error => {
			console.log(error);
		});
	};

	// D3's equirectangular projection and overlay - whole world, with or 
	// without country borders
	// NOTE: this function is not currently used (see the bottom of this file 
	// with the switch statement to see the functions being used in the current
	// version
	var equirectangular = function() {
		d3.json("/geoJSON/world-50m.json")
		.then( world => {
			d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

			var projection = d3.geoEquirectangular();

			var path = d3.geoPath()
				.projection(projection);

			countries = vis.select("g")
				.append("g")
				.attr("id", "map_overlay" + id)
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
			vis.select("g").select("#map_overlay" + id).moveToBack();
		})
		.catch(error => {
			console.log(error);
		});
	};

	// This function is used to parse the US Map svg file as xml and get 
	// the path tag based on the selected states and to be rendered d3js
	var svgUSMap = function() {

		// input file containing the US map geometries for all states
		d3.json("/assets/counties-10m.json").then(us => {
			console.log("in svgUSMap fn..");

			// remove any previous maps
			d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

			// create the map generator with the right AlbersUSA projection
			let geo_generator = d3.geoPath().projection(d3.geoAlbersUsa());

			states = vis.select("g")
				.append("g")
				.attr("id", "map_overlay" + id)
				.classed("map_overlay", true)

				var array = topojson.feature(us, us.objects.states).features
					var arraycopy = [...array];

			var countiesArray = topojson.feature(us, us.objects.counties).features
				var countiesArraycopy = [...countiesArray];

			//TODO: Optimize
			// deal with entire US map with all states
			if (state[0]._state_name.toLowerCase() == "all") { 
				var visData = arraycopy
			}
			else {  // the set of states specified in the input param
				// filtering the attributes of the chosen states
				var visData = arraycopy.filter(function(d) {
					for (let i = 0; i < state.length; i++) {
						if (d.properties.name.toLowerCase() == 
								state[i]._state_name.toLowerCase()) {
								d.properties.stroke_color = state[i]._stroke_color
								d.properties.fill_color = state[i]._fill_color
								d.properties.stroke_width = state[i]._stroke_width
								return true
							}
						}
						return false
					})
				// now get the county attributes for the chosen states
				var countiesvisdata = countiesArraycopy.filter(function(d) {
					for (let i = 0; i < state.length; i++) {
						if (state[i]._view_counties == true) {
							for (let j = 0; j < state[i]._counties.length; j++){
								if (d.id == state[i]._counties[j]._geoid
									&& state[i]._counties[j]._hide !== true) {
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
				// add the county data to the state data
				visData = visData.concat(countiesvisdata)
			}

			// create the path - geometry and attributes
			states.selectAll("path")
				.attr("class", "land")
				.attr("id", "state_fips")
				.data(visData)
				.enter()
				.append("path")
				.attr("fill", function(d) {
					return BridgesVisualizer.getColor(d.properties.fill_color)
				})
				.attr("d", geo_generator)
				.attr("stroke", function(d) {
					return BridgesVisualizer.getColor(d.properties.stroke_color)
				})
				.attr("stroke-width", function(d) {
					return d.properties.stroke_width
				})


			// create svg document with needed params

			let mySVG = document.getElementById('svg' + id);
			let bbox = document.getElementById("map_overlay" + id).getBBox();
			mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + 
								bbox.width + " " + bbox.height);
			document.getElementsByTagName('g')[0].setAttribute("transform", 
								"translate(" + 0 + "," + 0 + ")");

			// Send the overlay to the back to catch mouse events
			vis.select("g").select("#map_overlay" + id).moveToBack();
		})
		.catch(error => {
			console.log("Counties Reading Error:" + error);
		});
	}

	var svgWorldMap = function() {

		// reading world country data
		// this file contains the boundary geometry of all countries
		d3.json("/assets/world_countries.json").then( us => {

			// remove any earlier stored maps
			d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

			// map generator
			let geo_generator = d3.geoPath().projection(d3.geoEquirectangular());

			states = vis.select("g")
				.append("g")
				.attr("id", "map_overlay" + id)  // for subassignments
				.classed("map_overlay", true)
				let array = topojson.feature(us, us.objects.countries).features
				let arraycopy = [...array];

			// parsing the data
			if (state[0]._country_name.toLowerCase() == "all") { // entire world
				var visData = arraycopy
			}
			else {  
				// filter the selected countries
				var visData = arraycopy.filter(function(d) {
					for (let k = 0; k < state.length; k++) {
						if (d.properties.name.toLowerCase() == 
								state[k]._country_name.toLowerCase()) {
							d.properties.stroke_color = state[k]._stroke_color;
							d.properties.fill_color = state[k]._fill_color;
							d.properties.stroke_width = state[k]._stroke_width;
							return true;
						}
					}
				})
			}

			states.selectAll("path")
				.attr("class", "land")
				.attr("id", "state_fips")
				.data(visData)
				.enter()
				.append("path")
				.attr("d", geo_generator)
				.attr("fill",(d)=>BridgesVisualizer.getColor(d.properties.fill_color))
				.attr("stroke",(d)=>BridgesVisualizer.getColor(d.properties.stroke_color))
				.attr("stroke-width", (d) => d.properties.stroke_width)

			// create svg object and set parameters for document
			let mySVG = document.getElementById('svg' + id);
			let bbox = document.getElementById("map_overlay" + id).getBBox();
			mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + 
								bbox.width + " " + bbox.height);
			document.getElementsByTagName('g')[0].setAttribute("transform", 
								"translate(" + 0 + "," + 0 + ")");

			// Send the overlay to the back to catch mouse events
			vis.select("g").select("#map_overlay" + id).moveToBack();
		})
		.catch(error => {
			console.log(error);
		});
	};

	//  Call the appropriate projection and overlay functions
	switch (map_projection.toLowerCase()) {
		case "equirectangular":
			svgWorldMap();
			break;
		case "albersusa":
			svgUSMap();
			break;
		case "equirectangularOld":
			equirectangular();
			break;
	}
};
