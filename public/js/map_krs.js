
// This file contains the functions to retrieve map data and render it using d3js
// Handles both SVG and Canvas rendering

// This function is used retrieve US Map state and county data
function getUSStateData (map_json, selected_states) {
	let state_data = topojson.feature(map_json, map_json.objects.states).features;
	let state_copy = [...state_data];
//console.log("in getUSData..infile statedata" + JSON.stringify(state_data) + "\n\n\n\n");

	let stateData = {};

	if (selected_states[0]._state_name.toLowerCase() == "all") {  // all states
		visData = state_copy;
	}
	else {  // the set of states specified in the input param
		// filtering the attributes of the chosen states
		stateData = state_copy.filter(function(d) {
			for (let i = 0; i < selected_states.length; i++) {
				if (d.properties.name.toLowerCase() == 
						selected_states[i]._state_name.toLowerCase()) {
						d.properties.stroke_color = selected_states[i]._stroke_color;
						d.properties.fill_color = selected_states[i]._fill_color;
						d.properties.stroke_width = selected_states[i]._stroke_width;
						return true;
					}
				}
				return false;
		})
	}
// console.log("in getUSData..my statedata" + JSON.stringify(stateData));
	return stateData;
}
//-------------------------------------------------
function getUSCountyData (map_json, selected_states) {
	let county_data = topojson.feature(map_json, map_json.objects.counties).features;
	let county_copy = [...county_data];

	let countyData = {};
	// get the county attributes for the chosen states
	countyData = county_copy.filter(function(d) {
		for (let i = 0; i < selected_states.length; i++) {
			if (selected_states[i]._view_counties == true) {
				for (let j = 0; j < selected_states[i]._counties.length; j++){
					if (d.id == selected_states[i]._counties[j]._geoid
							&& selected_states[i]._counties[j]._hide !== true) {
						d.properties.stroke_color = selected_states[i]._counties[j]._stroke_color;
						d.properties.fill_color = selected_states[i]._counties[j]._fill_color;
						d.properties.stroke_width = selected_states[i]._counties[j]._stroke_width;
						return true;
					}
				}
			}
		}
		return false
	})
	return countyData;
}
//-------------------------------------------------
function getCountryData(map_json, selected_countries) {

//	let country_data = topojson.feature(map_json, map_json.objects.countries).features;
//	let country_copy = [...country_data];

	country_data =  map_json.features;
console.log ("Country Data (original):" + JSON.stringify(country_data));
	let country_copy = [...country_data];

	// parse the data
	let countryData = {};
	if (selected_countries[0]._country_name.toLowerCase() == "all") { // entire world
		var visData = country_copy;
	}
	else {  // filter the selected countries
		countryData = country_copy.filter(function(d) {
			for (let k = 0; k < selected_countries.length; k++) {
console.log(d.id);
//				if (d.properties.name.toLowerCase() == 
//						selected_countries[k]._country_name.toLowerCase()) {
				if (d.id.toLowerCase() == 
						selected_countries[k]._alpha3.toLowerCase()) {
					d.properties.stroke_color = selected_countries[k]._stroke_color;
					d.properties.fill_color = selected_countries[k]._fill_color;
					d.properties.stroke_width = selected_countries[k]._stroke_width;
					return true;
				}
			}
			return false;
		})
	}

console.log ("Country Data (modified):" + JSON.stringify(countryData));
	return countryData;
}
//-------------------------------------------------
// This function is used SVG rendered US and World Maps using d3js
function renderSVG_Map (visData, id, vis, proj) {
	// create the map generator with the right provided projection
	let geo_generator = d3.geoPath().projection(proj);


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
		.attr("d", geo_generator)
		.attr("fill", (d) => BridgesVisualizer.getColor(d.properties.fill_color))
		.attr("stroke", (d) => BridgesVisualizer.getColor(d.properties.stroke_color))
		.attr("stroke-width", (d) => d.properties.stroke_width)

	// create svg document with needed params
	let mySVG = document.getElementById('svg' + id);
	let bbox = document.getElementById("map_overlay" + id).getBBox();
	mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + 
							bbox.width + " " + bbox.height);
	document.getElementsByTagName('g')[0].setAttribute("transform", 
						"translate(" + 0 + "," + 0 + ")");

	// Send the overlay to the back to catch mouse events
	vis.select("g").select("#map_overlay" + id).moveToBack();
//	console.log("vis data: "+ JSON.stringify(visData)); 
}
//-------------------------------------------------
// This function is used Canvas rendered US and World Maps using d3js
function renderCanvas_Map (visData, id, canvas, proj) {

	// get the canvas's 2d context
	let canvas_node = document.getElementById("canvas0");
	let ctx = canvas_node.getContext("2d");

	// create the map generator with the provided projection
	let geo_generator = d3.geoPath().projection(proj).context(ctx);

	// path initialization
	ctx.beginPath();


	// remove any previous maps
	let container = canvas.node().parentNode;
	d3.select(container).selectAll(".map_overlay").remove();

	console.log("canvas:" + document.getElementById("canvas0").getContext("2d"));

	// get width and height of vis
	let width = canvas_node.width;
	let height = canvas_node.height;

	console.log("dims:" + width + "," + height);

	let vis = d3.select(container)
		.append("g")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "map_overlay_canvas_" + id)
		.attr("class", "map_overlay_canvas");

	// create the path - geometry and attributes
	states = vis.append("g")
		.attr("id","map_overlay"+id)
		.classed("map_overlay", true)

	vis.selectAll("path")
		.attr("class", "land")
		.attr("id", "state_fips")
		.data(visData)
		.enter()
		.append("path")
		.attr("d", geo_generator)
		.attr("fill", (d) => BridgesVisualizer.getColor(d.properties.fill_color))
		.attr("stroke", (d) => BridgesVisualizer.getColor(d.properties.stroke_color))
		.attr("stroke-width", (d) => d.properties.stroke_width)

	// update the transformation based on the sibling transform
	vis.zoom = function(d) {
		d3.select("#map_overlay"+id)
	 		.attr("transform", d3.zoomTransform(canvas.node()));
	};

	vis.select("g").select("#map_overlay"+id).moveToBack();
	canvas.registerMapOverlay(vis);
	// console.log("states(canvas_geom):" + JSON.stringify(states.selectAll("path").attr("d")));
	// console.log("vis data:" + JSON.stringify (visData));

	// console.log("canvas:" + document.getElementById("canvas0").getContext("2d"));
	
}
//-------------------------------------------------
function generateSVG_USMap(infile, selected_states, id, vis) {
	// input file containing the US map geometries for all states
	d3.json(infile).then(map_json => {
		let visData = getUSStateData(map_json, selected_states);
		let county_visData = getUSCountyData(map_json, selected_states);

		// add the county data to the state data
		visData = visData.concat(county_visData);

		renderSVG_Map(visData, id, vis, d3.geoAlbersUsa());
	})
	.catch(error => {
		console.log("Map reading error:" + error);
	});
}
//-------------------------------------------------
function generateSVG_WorldMap(infile, selected_countries, id, vis) {
	// input file containing the US map geometries for all states
	d3.json(infile).then(map_json => {

		let visData = getCountryData(map_json, selected_countries);
		renderSVG_Map(visData, id, vis, d3.geoEquirectangular());
	})
	.catch(error => {
		console.log("Map reading error:" + error);
	});
}
//-------------------------------------------------
function generateCanvas_USMap(infile, selected_states, id, canvas) {
	// input file containing the US map geometries for all states
	d3.json("/assets/counties-10m.json").then(map_json => {
		let visData = getUSStateData(map_json, selected_states);
		let county_visData = getUSCountyData(map_json, selected_states);

		// add the county data to the state data
		visData = visData.concat(county_visData);

		renderCanvas_Map(visData, id, canvas, d3.geoAlbersUsa());
	})
	.catch(error => {
		console.log("Map reading error:" + error);
	});
}

//-------------------------------------------------
function generateCanvas_WorldMap(infile, selected_countries, id, canvas) {
	// input file containing the US map geometries for all states
	d3.json(infile).then(map_json => {

		let visData = getCountryData(map_json, selected_countries);
		renderCanvas_Map(visData, id, canvas, d3.geoEquirectangular());
	})
	.catch(error => {
		console.log("Map reading error:" + error);
	});
}

//-------------------------------------------------
// the following function generates SVG maps of US  and World countries
BridgesVisualizer.map = function(vis, overlay, map_projection, selected_states) {

/** 
 * vis - root node at which the map document is created
 * overlay - is this being used?
 * map_projection - projection parameter for the map
 * selected_states - array of US states or Country names. 
 * If selected_states == ["all"] it refers to all states or all countries 
 */

	// get id of svg -- to identify sub assignments
	let id = +vis.attr("id").substr(3);
	if (!id || isNaN(id))
		id = 0;

	// generate the map
	switch (map_projection.toLowerCase()) {
		case "equirectangular":
//		generateSVG_WorldMap("/assets/world_countries.json", selected_states, id, vis);
		generateSVG_WorldMap("/assets/world2.json", selected_states, id, vis);
		break;
	case "albersusa":
		generateSVG_USMap("/assets/counties-10m.json", selected_states, id, vis);
		// console.log("svg map data:" + JSON.stringify(vis));
		break;
	}
}
//-------------------------------------------------

// the following function generates Canvas maps of US  and World countries 
BridgesVisualizer.map_canvas = function(canvas, overlay, map_projection, selected_states) {

	// get id of canvas
	var id = +vis.attr("id").substr(6);
	if(!id || isNaN(id)) id = 0;

	switch (map_projection.toLowerCase()) {
		case "equirectangular":
			generateCanvas_WorldMap("/assets/world_countries.json", selected_states, id, canvas);
			break;
		case "albersusa":
			generateCanvas_USMap("/assets/counties-10m.json", selected_states, id, canvas);
			break;
		break;
	}
}
//-------------------------------------------------
