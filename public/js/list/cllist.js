/*

Circular Linked List visualization for Bridges

*/
d3.csllist = function(d3, canvasID, w, h, data) {

    var visID = canvasID.substr(4);
    var finalTranslate = BridgesVisualizer.defaultTransforms.list.translate;
    var finalScale =  BridgesVisualizer.defaultTransforms.list.scale;
    var dataLength = Object.keys(data).length;

    // var spacing = 5;        // spacing between elements
    var spacing = 115;
    var marginLeft = 20;
    var defaultSizeH = 100;  // default size of each element box
    var defaultSizeW = 160;  // default width of each element box
    var elementsPerRow = 4 * parseInt((w - (spacing + defaultSizeH)) / (spacing + defaultSizeH));

    var transformObject = BridgesVisualizer.getTransformObjectFromCookie(visID);
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
        .attr("id",function(d,i){
          return "svg"+visID+"g"+i;
        })
        .attr("transform", function(d, i) {
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + defaultSizeH)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+defaultSizeH))) + ")";
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
        .attr("stroke-width",2);

    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 30)
        .attr("x2", 30)
        .style("stroke", "black")
        .attr("stroke-width",2);

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
            return 160;
          }else{
            return 50;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return defaultSizeH / 2;
          }else{
            return 50;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return 145;
          }else{
            return 145;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != dataLength-1) ){
            return 145;
          }else{
            return 225;
          }
        })
        .attr("stroke",function(d,i){
            if(d.forwardlink) return BridgesVisualizer.getColor(d.forwardlink.color)
            else return "black";
        })
        .attr("stroke-width",5)
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

    for(var qq = elementsPerRow-1; qq < dataLength; qq=qq+ (1*elementsPerRow) ){
        d3.select(d3.select("#svg"+visID+"forward-link-"+qq)[0][0].parentNode)
            .append("line")
            .attr("class","backward-horizontal-link")
            .attr("stroke",function(d,i){
                return d3.select(this.parentNode).select(".forward-link").attr("stroke");
             })
            .attr("stroke-width",5)
            .attr("y1", function(d,i){
              return d3.select(this.parentNode).select(".forward-link").attr("y1");
            })
            .attr("y2", function(d,i){
              return d3.select(this.parentNode).select(".forward-link").attr("y1");
            })
            .attr("x1", function(d,i){
              return ( (elementsPerRow-1) * (-1*(spacing + defaultSizeH)) ) + 15;
            })
            .attr("x2", function(d,i){
              return d3.select(this.parentNode).select(".forward-link").attr("x1");
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
          .attr("stroke",function(){return d3.select(this.parentNode).select(".forward-link").attr("stroke");})
          .attr("stroke-width",5)
          .attr("y1", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1")) - 3;
          })
          .attr("y2", function(d,i){
              return parseInt( d3.select(this.parentNode).select(".backward-horizontal-link").attr("y1") ) + 100;
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
    }

    for(var qq = 0; qq < dataLength; qq++){
        d3.select("#svg"+visID+"g"+qq).moveToBack();
    }

    var last_g = svgGroup.select("#svg"+visID+"g"+parseInt(dataLength-1));

    last_g
        .select(".forward-link")
        .attr("marker-start","")
        .attr("marker-end","url('#Circle')")
        .attr("x1",145)
        .attr("x2",145)
        .attr("y1",160)
        .attr("y2",defaultSizeH / 2);


    last_g
        .append("line")
        .attr("class","last-g-horizontal-line")
        .attr("x1", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".forward-link").attr("x1"));
        })
        .attr("x2", function(d,i){
              number_of_rows_left = (-1*( parseInt(dataLength) % elementsPerRow)) + elementsPerRow;
              if( number_of_rows_left ==  elementsPerRow-1){
                  return (-1*(spacing + defaultSizeH)) + 134;
              }

              if( (dataLength) % elementsPerRow == 0){
                  return ((elementsPerRow-1) * (-1*(spacing + defaultSizeH))) - 80;
              }
              number_of_rows_left = parseInt(dataLength) % elementsPerRow;
              return ((number_of_rows_left) * (-1*(spacing + defaultSizeH))) + 130;
        })
        .attr("y1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".forward-link").attr("y1")) - 3;
        })
        .attr("y2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".forward-link").attr("y1")) - 3;
        })
        .attr("stroke",function(d,i){
              return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
         })
        .attr("stroke-width",5);

      last_g
          .append("line")
          .attr("class","last-g-vertical-line")
          .attr("x1", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("x2"));
          })
          .attr("x2", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("x2"));
          })
          .attr("y1", function(d,i){
                number_of_rows_left = parseInt(dataLength / elementsPerRow);
                if( (dataLength) % elementsPerRow == 0){
                  number_of_rows_left = parseInt(dataLength / elementsPerRow) - 1;
                  return (-1 * ((number_of_rows_left * (defaultSizeH + spacing) )) ) + 50;
                }
                return (-1 * ((number_of_rows_left * (defaultSizeH + spacing) )) ) + 50;
          })
          .attr("y2", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("y1"));
          })
          .attr("stroke",function(d,i){
              return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
           })
          .attr("stroke-width",5);


      last_g
          .append("line")
          .attr("x2", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("x2"));
          })
          .attr("x1", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("x2")) + 60;
          })
          .attr("y1", function(d,i){
                return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("y1"));
          })
          .attr("y2", function(d,i){
                return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("y1"));
          })
          .attr("stroke",function(d,i){
              return d3.select(this.parentNode).select(".forward-link").attr("stroke") || "black";
           })
          // .attr("stroke","yellow")
          .attr("stroke-width",5)
          .attr("marker-start","url('#Triangle')");

      nodes
         .append("rect")
         .attr("height", function(d) {
             return defaultSizeH;
         })
         .attr("width", function(d) {
             return defaultSizeW + 52.5;
         })
         .style("opacity","0");

     // bind linebreaks to text elements
     svgGroup.selectAll('text').each(BridgesVisualizer.insertLinebreaks);

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
