
// This file contains the functions to retrieve map data and render it using d3js
// Handles both SVG and Canvas rendering

// This function is used retrieve US Map state and county data
function getUSMapData (infile, selected_states) {
	// input file containing the US map geometries for all states
	d3.json("/assets/counties-10m.json").then(map_json => {
		console.log("in getUSMapData()..");

		let state_data = topojson.feature(map_json, map_json.objects.states).features
		let state_copy = [...state_data];

		let county_data = topojson.feature(map_json, map_json.objects.counties).features
		let county_copy = [...county_data];

		let visData, county_visData;

		if (selected_states[0]._state_name.toLowerCase() == "all") {  // all states
			visData = state_copy
		}
		else {  // the set of states specified in the input param
			// filtering the attributes of the chosen states
			visData = state_copy.filter(function(d) {
				for (let i = 0; i < selected_states.length; i++) {
					if (d.properties.name.toLowerCase() == 
							state[i]._state_name.toLowerCase()) {
							d.properties.stroke_color = selected_states[i]._stroke_color;
							d.properties.fill_color = selected_states[i]._fill_color;
							d.properties.stroke_width = selected_states[i]._stroke_width;
							return true
						}
					}
					return false;
				})
			// now get the county attributes for the chosen states
			county_visData = county_copy.filter(function(d) {
				for (let i = 0; i < state.length; i++) {
					if (state[i]._view_counties == true) {
						for (let j = 0; j < state[i]._counties.length; j++){
							if (d.id == state[i]._counties[j]._geoid;
								&& state[i]._counties[j]._hide !== true) {
								d.properties.stroke_color = state[i]._counties[j]._stroke_color;
								d.properties.fill_color = state[i]._counties[j]._fill_color;
								d.properties.stroke_width = state[i]._counties[j]._stroke_width;
								return true;
							}
						}
					}
				}
				return false
			})
			// add the county data to the state data
			visData = visData.concat(county_visData);
		}
		return visData;
	})
	.catch(error => {
		console.log("Map reading error:" + error);
	});
}

function getWorldMapData (infile, selected_countries) {
	// reading world country data
	// this file contains the boundary geometry of all countries
	d3.json(infile).then(map_json => {

		// remove any earlier stored maps
		d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

		// map generator
		let geo_generator = d3.geoPath().projection(d3.geoEquirectangular());

		states = vis.select("g")
			.append("g")
			.attr("id", "map_overlay" + id)  // for subassignments
			.classed("map_overlay", true)
			let array = topojson.feature(map_json, map_json.objects.countries).features
			let arraycopy = [...array];

		// parsing the data
		if (selected_states[0]._country_name.toLowerCase() == "all") { // entire world
			var visData = arraycopy
		}
		else {  
			// filter the selected countries
			var visData = arraycopy.filter(function(d) {
				for (let k = 0; k < selected_states.length; k++) {
					if (d.properties.name.toLowerCase() == 
							selected_states[k]._country_name.toLowerCase()) {
						d.properties.stroke_color = state[k]._stroke_color;
						d.properties.fill_color = state[k]._fill_color;
						d.properties.stroke_width = state[k]._stroke_width;
						return true;
					}
				}
			})
		}
		return visData;
	})
	.catch(error => {
		console.log(error);
	});
}
		
// This function is used render the US Map state and county data using d3js
function renderUSMapSVG (visData) {
	// create the map generator with the right AlbersUSA projection
	let geo_generator = d3.geoPath().projection(d3.geoAlbersUsa());

	// remove any previous maps
	d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

	let states = vis.select("g")
		.append("g")
		.attr("id", "map_overlay" + id)
		.classed("map_overlay", true)

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
}

function renderWorldMapSVG (visData) {
	// remove any earlier stored maps
	d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

	// map generator
	let geo_generator = d3.geoPath().projection(d3.geoEquirectangular());
	let states = vis.select("g")
		.append("g")
		.attr("id", "map_overlay" + id)  // for subassignments
		.classed("map_overlay", true)

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
}
BridgesVisualizer.map = function(vis, overlay, map_projection, selected_states) {

// Input Params:
// 		vis - root node at which the map document is created
//		overlay - is this being used?
//		map_projection - projection parameter for the map
// 		selected_states - array of US states or Country names. 
//		If selected_states == ["all"] it refers to all states or all countries 

	// get id of svg -- to identify sub assignments
	let id = +vis.attr("id").substr(3);
	if (!id || isNaN(id))
		id = 0;

	// get the US map data 
	switch (map_projection.toLowerCase()) {
		case "equirectangular":
			// note: actually passing selected countries for world
			visData = getWorldMapData("/assets/world_countries.json", selected_states);
			renderWorldMapSVG (visData);
			break;
		case "albersusa":
			visData = getUSMapData ("/assets/counties-10m.json", selected_states)
			renderUSMapSVG(visData);
			break;
	}

}
