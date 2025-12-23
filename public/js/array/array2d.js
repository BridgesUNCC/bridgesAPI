/*

2D Array visualization for Bridges

*/
d3.array2d = function(svg, W, H, data, dimensions) {

    // defaults
    var array2d = {},
        svgGroup,
        w = W || 1280,
        h = H || 800,
        finalTranslate,
        finalScale,
        transform,
        elementsPerRow = dimensions[0],
        spacing = 30, // spacing between elements
        defaultSize = 100,  // default size of each element box
        levelCount = -1;

	// zoom related
    var zoom = d3.zoom()
		.extent([[0,0], [w, h]])
        .scaleExtent([0.1,2])
        .on("zoom", zoomed);

    function zoomed(evt) {
      if(svgGroup) {
        svgGroup.attr("transform", evt.transform);
      }
    }

    array2d.reset = function() {
      finalTranslate = BridgesVisualizer.defaultTransforms.Array2D.translate;
      finalScale =  BridgesVisualizer.defaultTransforms.Array2D.scale;
      transform = d3.zoomIdentity.translate(finalTranslate[0], 
				finalTranslate[1]).scale(finalScale);
      svg.call(zoom.transform, transform);
    };

    array2d.reset();

    vis = svg
          .attr("width", w)
          .attr("height", h)
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 " + w + " " + h)
          .classed("svg-content", true)
          .call(zoom)
          .call(zoom.transform, transform);

    array2d.resize = function() {
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
    
    svgGroup = vis.append("g").attr('transform', transform);

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll(".nodes")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + ((i % elementsPerRow) * (spacing + defaultSize)) + "," + ((Math.floor(i / elementsPerRow)) * (spacing + defaultSize)) + ")";
        })
        .on("mouseover", function(evt, d) { BridgesVisualizer.textMouseover(d.name); } )
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
    nodes
        .append("text")
        .attr("class","index-textview")
        .text(function(d, i){
          if((i % elementsPerRow === 0)){
              levelCount++;
          }
          return "("+(i % elementsPerRow)+", "+ levelCount +")";
        })
        .attr("y", 115)
        .attr("x", function(){
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSize);
        });

    // Show full array label above each element
    nodes
        .append("text")
        .attr("class","nodeLabel")
        .text(function(d, i){
          return d.name + " " + d3.select(this.parentNode).select(".index-textview").text();
        })
        .attr("y", -10)
        .style("display","none");

    // Show array labels inside each element
    nodes
        .append("text")
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


    return array2d;
};
