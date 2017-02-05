/*

Doubly Linked List visualization for Bridges

*/
d3.dllist = function(d3, canvasID, w, h, data) {

    var visID = canvasID.substr(4);
    var finalTranslate = BridgesVisualizer.defaultTransforms.list.translate;
    var finalScale =  BridgesVisualizer.defaultTransforms.list.scale;
    var dataLength = Object.keys(data).length;

    var spacing = 115;  // spacing between elements
    var marginLeft = 20;
    var defaultSizeH = 100;  // default size of each element box
    var defaultSizeW = 160;  // default size of each element box
    var elementsPerRow = 4 * parseInt((w - (spacing + defaultSizeH)) / (spacing + defaultSizeH));

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

    // var elementsPerRow = 4 * parseInt((w - (spacing + defaultSizeH)) / (spacing + defaultSizeH));
    // var elementsPerRow = 2;
    // var elementsPerRow = data.rows || dataLength;

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("id",function(d,i){
          return "svg"+visID+"g"+i;
        })
        .attr("transform", function(d, i) {
            //size = parseFloat(d.size || defaultSizeH);
            size = defaultSizeH;
            //return "translate(" + (marginLeft + i * (spacing + size)) + ")";
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + size)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+size))) + ")";
        })
        .on("mouseover", BridgesVisualizer.textMouseover)
        .on("mouseout", BridgesVisualizer.textMouseout);

    // Create squares for each array element
    nodes
        .append("rect")
        .attr("id",function(d,i){
          return "svg"+visID+"rect"+i;
        })
        .attr("height", function(d) {
            return defaultSizeH;
        })
        .attr("width", function(d) {
            return defaultSizeW;
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
          return i;
        })
        .attr("y", 115)
        .attr("x", function(){
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSizeW);
        });


    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 130)
        .attr("x2", 130)
        .attr("stroke", "black")
        .attr("stroke-width",2)
    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 30)
        .attr("x2", 30)
        .style("stroke", "black")
        .attr("stroke-width",2)

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
            return BridgesVisualizer.centerTextHorizontallyInRect(this, defaultSizeW);
        })
        .attr("y", defaultSizeH / 2)
        .attr("dy", ".35em");

    nodes
        .append("line")
        .attr("class","forward-link")
        .attr("id", function(d,i){
            return "svg"+visID+"forward-link-"+i;
        })
        .attr("y1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            // return 198;
            return 160;
          }else{
            return 30;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return defaultSizeH - 70;
          }else{
            return 30;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return 145 + 10;
          }else{
            return 145;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){ return 145 + 10; }
          else{ return 225; }
        })
        .attr("stroke",function(d,i){
            if(d.forwardlink) return BridgesVisualizer.getColor(d.forwardlink.color);
            else return "black";
        })
        .attr("stroke-width",function(d){
            if(d.forwardlink) return d.forwardlink.thickness;
            else return 3;
        })
        .attr("marker-end",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return "url('#Circle')";
          }else{
            return "url('#Triangle')";
          }
        })
        .attr("marker-start",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            // return "url('#Triangle')";
          }else{
            return "url('#Circle')";
          }

        });


    nodes
        .append("line")
        .attr("class","backward-link")
        .attr("id", function(d,i){
            return "svg"+visID+"backward-link"+i;
        })
        .attr("y1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            // return 198;
            return 160 - 30;
          }else{
            return 70;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return defaultSizeH - 25;
          }else{
            return 70;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return 145  - 10;
          }else{
            return 152;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return 145  - 10;
          }else{
            return 232;
          }
        })
        .attr("stroke",function(d,i){
            if(d.backwardlink != undefined && d.backwardlink.color) return BridgesVisualizer.getColor(d.backwardlink.color);
            else return "black";
        })
        // .attr("stroke","pink")
        .attr("stroke-width",function(d){
            if(d.backwardlink) return d.backwardlink.thickness;
            else return 3;
        })
        .attr("marker-end",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return "url('#Triangle')";
          }else{
            return "url('#Circle')";
          }

        })
        .attr("marker-start",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            // return "url('#Triangle')";
          }else{
            return "url('#Triangle')";
          }

        });

        for(var qq = elementsPerRow-1; qq < dataLength; qq=qq+ (1*elementsPerRow) ){
            d3.select(d3.select("#svg"+visID+"forward-link-"+qq)[0][0].parentNode)
                .append("line")
                .attr("class","backward-horizontal-link")
                .attr("stroke",function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
                })
                .attr("stroke-width",function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("stroke-width");
                })
                .attr("y1", function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("y1");
                })
                .attr("y2", function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("y1");
                })
                .attr("x1", function(d,i){
                  return ( (elementsPerRow-1) * (-1*(spacing + defaultSizeH) ) ) + 25;

                })
                .attr("x2", function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("x1");
                })
                .attr("display",function(d,i){
                    if(dataLength-1 == qq){
                        return "none";
                    }
                });


            d3.select(d3.select("#svg"+visID+"backward-link"+qq)[0][0].parentNode)
                .append("line")
                .attr("class","forward-horizontal-link")
                .attr("stroke",function(d,i){
                    return d3.select(this.parentNode).select(".backward-link").attr("stroke") || "black";
                })
                .attr("stroke-width",function(d){
                    if(d.forwardlink) return d.forwardlink.thickness;
                    return d3.select(this.parentNode).select(".backward-link").attr("stroke-width");
                })
                .attr("y1", function(d,i){
                  return d3.select(this.parentNode).select(".backward-link").attr("y1");
                })
                .attr("y2", function(d,i){
                  return d3.select(this.parentNode).select(".backward-link").attr("y1");
                })
                .attr("x1", function(d,i){
                  return ( (elementsPerRow-1) * (-1*(spacing + defaultSizeH)) ) + 5;
                })
                .attr("x2", function(d,i){
                  return d3.select(this.parentNode).select(".backward-link").attr("x1");
                  // return 80;
                })
                .attr("display",function(d,i){
                    if(dataLength-1 == qq){
                        return "none";
                    }
                });
        }

        for(var qq = elementsPerRow-1; qq < dataLength; qq=qq+ (1*elementsPerRow) ){
          d3.select(d3.select("#svg"+visID+"forward-link-"+qq)[0][0].parentNode)
              .append("line")
              .attr("stroke",function(d,i){
                  return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
              })
              .attr("stroke-width",function(){
                  return d3.select(this.parentNode).select(".forward-link").attr("stroke-width") || 3;
              })
              .attr("y1", function(d,i){
                  return parseInt(d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1")) - 3;
              })
              .attr("y2", function(d,i){
                  return parseInt( d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1") ) + 100 - 25;
              })
              .attr("x1", function(d,i){
                return d3.select(this.parentNode).select(".backward-horizontal-link").attr("x1");
              })
              .attr("x2", function(d,i){
                return d3.select(this.parentNode).select(".backward-horizontal-link").attr("x1");
              })
              .attr("marker-end","url('#Triangle')")
              .attr("display",function(d,i){
                if(dataLength-1 == qq){
                    return "none";
                }
              });
          d3.select(d3.select("#svg"+visID+"backward-link"+qq)[0][0].parentNode)
              .append("line")
              .attr("stroke",function(d,i){
                return d3.select(this.parentNode).select(".backward-link").attr("stroke") || "black";
              })
              .attr("stroke-width",function(){
                  return d3.select(this.parentNode).select(".backward-link").attr("stroke-width") || 3;
              })
              .attr("y1", function(d,i){
                  return parseInt(d3.select(this.parentNode).select(".forward-horizontal-link").attr("y1")) - 3;
              })
              .attr("y2", function(d,i){
                  return parseInt( d3.select(this.parentNode).select(".forward-horizontal-link").attr("y1") ) + 100 + 55;
              })
              .attr("x1", function(d,i){
                return d3.select(this.parentNode).select(".forward-horizontal-link").attr("x1");
              })
              .attr("x2", function(d,i){
                return d3.select(this.parentNode).select(".forward-horizontal-link").attr("x1");
              })
              .attr("marker-end","url('#Circle')")
              .attr("display",function(d,i){
                if(dataLength-1 == qq){
                    return "none";
                }
              });
        }

        for(var qq = 0; qq < dataLength; qq++){
            d3.select("#svg"+visID+"g"+qq).moveToBack();
        }

    var first_g = svgGroup.select("#svg"+visID+"g0");
    var last_g = svgGroup.select("#svg"+visID+"g"+parseInt(dataLength-1));

    first_g.append("line")
        .attr("class","nullstartarrowpointer")
        .attr("stroke-width",5)
        .attr("marker-start","url('#Circle')")
        .attr("marker-end","url('#Triangle')")
        .attr("stroke",function(d,i){
            return "black";
        })
        .attr("x1",15)
        .attr("x2",-65)
        .attr("y1",70)
        .attr("y2",70);

    last_g.select(".forward-link")
        .attr("class","nullendarrowpointer")
        .attr("stroke",function(d,i){
            return "black";
        })
        .attr("marker-start","url('#Circle')")
        .attr("marker-end","url('#Triangle')")
        .attr("x1",145)
        .attr("x2",225)
        .attr("y1",30)
        .attr("y2",30);

    last_g.select(".backward-link")
        .attr("display","none");

   var squareSize = 60;
   first_g.
        append("rect")
          .attr("height", function(d) {
              return squareSize;
          })
          .attr("width", function(d) {
              return squareSize;
          })
          .attr("x", function(d,i){
              return parseFloat( d3.select(this.parentNode).select(".nullstartarrowpointer").attr("x2") ) - squareSize;
          })
          .attr("y", function(d,i){
              return squareSize - (squareSize/3);
          })
          .style("fill", "transparent")
          .attr("stroke","black")
          .attr("stroke-width",2);

    last_g
        .append("rect")
          .attr("height", function(d) {
              //return parseFloat(d.size || defaultSizeH);
              return squareSize;
          })
          .attr("width", function(d) {
              //return parseFloat(d.size || defaultSizeH);
              //alert(defaultSizeW);
              return squareSize;
          })
          .attr("x",function(d,i){
              return parseFloat( d3.select(this.parentNode).select(".nullendarrowpointer").attr("x2") );
          })
          .attr("y", function(d,i){
              return 0;
          })
          .attr("fill","transparent")
          .attr("stroke","black")
          .attr("stroke-width",2);

    last_g
        .append("text")
        .text("X")
        .attr("font-size","83px")
        .attr("x",function(d,i){
              return parseFloat( d3.select(this.parentNode).select(".nullendarrowpointer").attr("x2") ) + 2;
        })
        .attr("y",squareSize)
        .attr("width",40)
        .attr("height",40)
        .style("display","block");

    first_g
        .append("text")
        .text("X")
        .attr("font-size","83px")
        .attr("x",-123)
        .attr("y",squareSize+(squareSize*0.6666))
        .attr("width",40)
        .attr("height",40)
        .style("display","block");

    nodes
        .append("rect")
        .attr("height", function(d) {
            return defaultSizeH;
        })
        .attr("width", function(d) {
            return defaultSizeW + 52.5;
        })
        .style("opacity","0");

    svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);


    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
