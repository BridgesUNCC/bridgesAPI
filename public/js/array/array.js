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

    var zoom = d3.zoom()
        .scaleExtent([0.1,2])
        .on("zoom", zoomed);

    array.reset = function() {
      finalTranslate = BridgesVisualizer.defaultTransforms.array.translate;
      finalScale =  BridgesVisualizer.defaultTransforms.array.scale;
      transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

      svg.call(zoom.transform, transform);
    };
    array.reset();

    vis = svg
          .attr("width", w)
          .attr("height", h)
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 " + w + " " + h)
          .classed("svg-content", true)
          .call(zoom)
          .call(zoom.transform, transform);

    svgGroup = vis.append("g").attr('transform', transform);

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            //size = parseFloat(d.size || defaultSize);
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
    nodes
        .append("text")
        .attr("class","index-textview")
        .text(function(d, i){
          return i;
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
          return d.name;
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

    // zoom function
    function zoomed() {
      if(svgGroup) {
        svgGroup.attr("transform", d3.event.transform);
      }
    }

    return array;

};
