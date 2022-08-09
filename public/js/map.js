BridgesVisualizer.map = function(vis, overlay, map, state) {

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
    // var svg = null
    // d3.xml("/assets/us.svg", function(error, xml) {
    //   if (error) throw error;

    //   d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

    //   path = d3.geoPath();

    //   var projection = d3.geoAlbersUsa();

    //   var path = d3.geoPath().projection(projection);

    //   states = vis.select("g")
    //     .append("g")
    //       .attr("id","map_overlay"+id)
    //       .classed("map_overlay", true)

    //   var htmlSVG = document.getElementById("map_overlay"+id);
    //   htmlSVG.appendChild(xml.getElementById('svg1'));

    //   // d3 objects for later use
    //   svg = d3.select(htmlSVG);
    //   // svg.attr("stroke-width", 0.5)
    //   maproot = svg.select('#svg');

    //   // get the svg-element from the original SVG file
    //   var xmlSVG = d3.select(xml.getElementsByTagName('svg')[0]);
    //   // copy its "viewBox" attribute to the svg element in our HTML file
    //   svg.attr('viewBox', xmlSVG.attr('viewBox'));
    //   svg.selectAll("path")
    //       .attr("d", path)
    //       .attr("stroke","blue")
    //       .attr("stroke-width", 0.5)

    // })


    d3.json("/assets/states-10m.json", function(error, us) {
      if (error) throw error;

      d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

      path = d3.geoPath();

      var projection = d3.geoAlbersUsa()

      var path = d3.geoPath().projection(projection);

      states = vis.select("g")
        .append("g")
          .attr("id","map_overlay"+id)
          .classed("map_overlay", true)


      var array = topojson.feature(us, us.objects.states).features
      var arraycopy = [...array];


      if(state.toLowerCase() == "all"){
        var visData = arraycopy
      }else{
        var visData = arraycopy.filter(function(d) { return d.properties.name.toLowerCase() == state.toLowerCase()})
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


      var mySVG = document.getElementById('svg'+id);

      let bbox = document.getElementById("map_overlay"+id).getBBox();

      mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);
      document.getElementsByTagName('g')[0].setAttribute("transform", "translate(" + 0 + "," + 0 + ")");

      vis.select("g").select("#map_overlay"+id).moveToBack();

    })
  }

  var svgWorldMap = function(){

    d3.json("/assets/world_countries.json", function(error, us) {
      if (error) throw error;
 
      d3.select(vis.node().parentNode).selectAll(".map_overlay").remove();

      path = d3.geoPath();

      var projection = d3.geoEquirectangular();
      
      var path = d3.geoPath()
          .projection(projection);

      states = vis.select("g")
        .append("g")
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

      var mySVG = document.getElementById('svg'+id);

      let bbox = document.getElementById("map_overlay"+id).getBBox();

      mySVG.setAttribute("viewBox", bbox.x + " " + bbox.y + " " + bbox.width + " " + bbox.height);
      document.getElementsByTagName('g')[0].setAttribute("transform", "translate(" + 0 + "," + 0 + ")");

      vis.select("g").select("#map_overlay"+id).moveToBack();
    })
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
