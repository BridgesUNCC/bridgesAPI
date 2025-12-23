/*

Array visualization for Bridges

*/
d3.array = function(svg, W, H, data) {

    // defaults
    var array = {},
        svgGroup,
        w = W || 1280,
        h = H || 800,
        finalTranslate,
        finalScale,
        transform,
        spacing = 5, // spacing between elements
        defaultSize = 100;  // default size of each element box

	// zoom related
    var zoom = d3.zoom()

	function zoomed(evt) {
		if(svgGroup) {
			svgGroup.attr("transform", evt.transform);
		}
	}

	svg.call(d3.zoom()
		.extent([[0,0], [w, h]])
		.scaleExtent([0.1, 1.2])
		.on("zoom", zoomed))

	// get the array into an initial position
    array.reset = function() {
		finalTranslate = BridgesVisualizer.defaultTransforms.array.translate;
		finalScale =  BridgesVisualizer.defaultTransforms.array.scale;
		transform = d3.zoomIdentity.translate(finalTranslate[0], 
					finalTranslate[1]).scale(finalScale);
		svg.call(zoom.transform, transform);
    };

	// initial view of array
    array.reset();

	// initialize svg attributes
    vis = svg
          .attr("width", w)
          .attr("height", h)
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 " + w + " " + h)
          .classed("svg-content", true)


	// set up initial transform for group
    svgGroup = vis.append("g")
		.attr('transform', transform);

    array.resize = function() {
	var width = d3.select(".assignmentContainer").style("width"),
	    height = d3.select(".assignmentContainer").style("height");
	
	width = width.substr(0, width.indexOf("px"));
	height = height.substr(0, height.indexOf("px"));
	
	w = width;
	h = height;

	vis.attr("width", w)
            .attr("height", h)
            .attr("viewBox", "0 0 " + w + " " + h);
    }
    
    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            size = defaultSize;
            return "translate(" + (i * (spacing + size)) + ")";
        })
        .on("mouseover", function(evt, d) { 
			BridgesVisualizer.textMouseover(d.name); 
		} )
        .on("mouseout", BridgesVisualizer.textMouseout);

    // Create squares for each array element
    nodes.append("rect")
		.attr("height", defaultSize)
        .attr("width", defaultSize)
        .style("fill", function(d) {
            return BridgesVisualizer.getColor(d.color) || "steelblue";
        })
        .style("stroke", "gray")
        .style("stroke-width", 2);

    // Show array index below each element
	nodes.append("text")
        .attr("class","index-textview")
        .text(function(d, i){
			return i;
		})
        .attr("y", 125)
        .attr("x", function(){
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSize);
        });

	// Show full array label above each element
    nodes.append("text")
        .attr("class","nodeLabel")
        .text(function(d, i){
          return d.name;
        })
        .attr("y", -10)
        .style("display","none");

	// Show array labels inside each element
    nodes.append("text")
        .attr("class", "nodeLabelInside")
        .style("display", "block")
        .style("font-size", 30)
        .text(function(d) {
            return BridgesVisualizer.getShortText(d.name);
        })
        .attr("fill", "black")
        .attr("x", function(){
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSize);
        })
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");

    return array;
};
