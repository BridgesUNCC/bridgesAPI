/*

3D Array visualization for Bridges

*/
d3.array3d = function(svg, W, H, data, dimensions) {
    var array3d = {},
        svgGroup,
        w = W || 1280,
        h = H || 800,
        dimOne = dimensions[0],
        dimTwo = dimensions[1],
        dimThree = dimensions[2],
        spacing = 40, // spacing between elements
        defaultSize = 100,  // default size of each element box
        spacingBetweenGrid = defaultSize + 400,
        valueToCenterGridTitle = 195,
        levelCount = -1,
        finalTranslate,
        finalScale,
        elementsPerRow = dimOne,
        elementsPerColumn = (dimOne * dimTwo) / dimOne;

    var zoom = d3.zoom()
        .scaleExtent([0.1,2])
        .on("zoom", zoomed);

    array3d.reset = function() {
      finalTranslate = BridgesVisualizer.defaultTransforms.Array3D.translate;
      finalScale =  BridgesVisualizer.defaultTransforms.Array3D.scale;
      transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

      svg.call(zoom.transform, transform);
    };
    array3d.reset();

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
    var nodes = svgGroup.selectAll(".nodes")
        .data(data)
        .enter().append("g")
        .attr("xformx", function(d, i) { return (i % elementsPerRow) * (spacing + defaultSize); })
        .attr("xformy", function(d, i) { return Math.floor(i / elementsPerRow) * (spacing+defaultSize); })
        .attr("transform", function(d, i) {
            return "translate(" + ((i % elementsPerRow) * (spacing + defaultSize))+ "," + ((Math.floor(i / elementsPerRow)) * (spacing+defaultSize)) + ")";
        })
        .attr("id",function(d,i){
            return "g"+i;
        })
        .on("mouseover", function(d) { BridgesVisualizer.textMouseover(d.name); } )
        .on("mouseout", BridgesVisualizer.textMouseout);


    // Create squares for each array element
    nodes.append("rect")
        .attr("id",function(d,i){
            return "rect"+i;
        })
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
          var threeLevel = parseInt(i / (dimOne*dimTwo));

          if((i % elementsPerRow === 0)){
              levelCount++;
          }

          if(levelCount > (elementsPerColumn-1) ){
              levelCount = 0;
          }
          return "("+ (i % elementsPerRow) +", "+ levelCount  +", "+ threeLevel +")";
          // return "("+threeLevel+", "+(i % elementsPerRow)+", "+levelCount+")";
          // return "("+levelCount+", "+(i % elementsPerRow)+", "+threeLevel+")";
        })
        .attr("y", 115)
        .attr("x", defaultSize / 4);


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
          // return d.name.substr(0,3)+"...";
          return d.name;
        })
        .attr("fill", "black")
        .attr("x", 10)
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");

    var my_translateX = parseFloat(d3.select("#g"+(elementsPerRow-1)).attr("xformx")) + spacingBetweenGrid;
    svgGroup.select("#g0").attr("class","first-2d");

    var ii = 0;
    svgGroup.selectAll("g").each(function(d,i){

        if(i >= dimOne*dimTwo){
            d3.select(this).attr("transform",function(){
                if( i % (dimOne*dimTwo) === 0 ){
                    svgGroup.select("#g"+i).attr("class","first-2d");
                    ii++;
                }
                var tempI = i % (dimOne*dimTwo);
                return "translate("+(parseFloat(d3.select(this).attr("xformx"))+parseFloat(my_translateX*ii)) +","+  d3.select("#g"+tempI).attr("xformy") + ")";
            })
            .attr("xformx", (parseFloat(d3.select(this).attr("xformx"))+parseFloat(my_translateX*ii)))
            .attr("xformy", d3.select("#g"+(i % (dimOne*dimTwo))).attr("xformy"));
        }
    });

    var half2d = ( ( (spacing + defaultSize) * elementsPerRow) / 2 );

    //first2Ditems is the collection of the first node of every grid
    var first2Ditems = svgGroup.selectAll(".first-2d");
    first2Ditems.each(function(d,i){
        svgGroup
            .append("line")
            .attr("class",function(){
                if(i === 0){
                    return "first-v";
                }
                else if(i == first2Ditems._groups[0].length-1){
                    return "last-v";
                }
            })
            .attr("y1", -170)
            .attr("y2", -140)
            .attr("x1", parseFloat(d3.select(this).attr("xformx"))+half2d)
            .attr("x2", parseFloat(d3.select(this).attr("xformx"))+half2d)
            .attr("stroke", "black")
            .attr("stroke-width",5);

        svgGroup
            .append("text")
            .text(function(){
                return "(Slice: "+ i +")";
            })
            .attr("x", (parseFloat(d3.select(this).attr("xformx"))+half2d) - valueToCenterGridTitle)
            .style("font-size","100px")
            .attr("y", parseInt(d3.select(".first-v").attr("y2")) + 80);

    });

    //connecting the 2D grid with one horizontal line
    svgGroup
        .append("line")
        .attr("y1", d3.select(".first-v").attr("y1"))
        .attr("y2", d3.select(".first-v").attr("y1"))
        .attr("x1", d3.select(".first-v").attr("x1")-2)
        .attr("x2", +d3.select(".last-v").attr("x1")+2)
        .attr("stroke", "black")
        .attr("stroke-width",5);

    // zoom function
    function zoomed() {
      if(svgGroup) {
        svgGroup.attr("transform", d3.event.transform);
      }
    }

    return array3d;
};
