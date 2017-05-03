/*

Array visualization for Bridges

*/
d3.array2d = function(d3, canvasID, w, h, data, dimensions) {

  var visID = canvasID.substr(4);
  var finalTranslate = BridgesVisualizer.defaultTransforms.Array2D.translate;
  var finalScale =  BridgesVisualizer.defaultTransforms.Array2D.scale;

    var elementsPerRow = dimensions[0];
    var spacing = 40;        // spacing between elements
    var marginLeft = 20;
    var defaultSize = 100;  // default size of each element box
    var levelCount = -1;


    var transformObject = BridgesVisualizer.getTransformObjectFromLocalStorage(visID);
    if(transformObject){
      finalTranslate = transformObject.translate;
      finalScale = transformObject.scale;
    }

    var zoom = d3.behavior.zoom()
        .translate(finalTranslate)
        .scale(finalScale)
        .scaleExtent([0,5])
        .on("zoom", zoomHandler);
    allZoom.push(zoom);

    chart = d3.select(canvasID).append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svg" + canvasID.substr(4))
        .classed("svg", true)
        .call(zoom);

    var svgGroup = chart.append("g");
    // initialize the scale and translation
    svgGroup.attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
    allSVG.push(svgGroup);


    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + defaultSize)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing + defaultSize))) + ")";
        })
        .on("mouseover", BridgesVisualizer.textMouseover)
        .on("mouseout", BridgesVisualizer.textMouseout);

    // Create squares for each array element
    nodes.append("rect")
        .attr("height", function(d) {
            return defaultSize;
        })
        .attr("width", function(d) {
            return defaultSize;
        })
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
          if((i % elementsPerRow == 0)){
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

    svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
