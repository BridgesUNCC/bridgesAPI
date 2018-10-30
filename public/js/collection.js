//based loosely on bostock's example and
//http://bl.ocks.org/d3noob/5141278
d3.collection = function(svg, W, H, data) {

     //defaults
    var graph = {},
        w = W || 1280,
        h = H || 800,
        i = 0,
        vis,
        svgGroup,
        defs,
        finalTranslate,
        finalScale,
        transform;

    // pad domains
    data.domainX[0] = data.domainX[0] + (data.domainX[0] * 0.1);
    data.domainX[1] = data.domainX[1] + (data.domainX[1] * 0.1);
    data.domainY[0] = data.domainY[0] + (data.domainY[0] * 0.1);
    data.domainY[1] = data.domainY[1] + (data.domainY[1] * 0.1);

    var xScale = d3.scaleLinear().domain(data.domainX).range([-w/2,w/2]);
    var yScale = d3.scaleLinear().domain(data.domainY).range([h/2,-h/2]); // negatives invert to cartesian space

    // determine how to scale the symbols as a function of the current scales and default scales
    // var symbolScale =

    console.log('domains', xScale.domain(), yScale.domain());
    console.log('ranges', xScale.range(), yScale.range());



    graph.reset = function() {

      if(!data.coord_system_type || data.coord_system_type == "cartesian") {
        // finalTranslate = BridgesVisualizer.defaultTransforms.collection.translate;
        // finalScale = BridgesVisualizer.defaultTransforms.collection.scale;
        // transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);
      } else {
        // finalTranslate = BridgesVisualizer.defaultTransforms[data.coord_system_type].translate;
        // finalScale = BridgesVisualizer.defaultTransforms[data.coord_system_type].scale;
        // transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);
      }
      // svg.call(zoom.transform, transform);
    };
    // graph.reset();

    vis = svg.attr("width", w)
            .attr("height", h)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + w + " " + h)
            .classed("svg-content", true);
            // .call(zoom)
            // .call(zoom.transform, transform);


    // translate origin to center of screen
    transform = "translate(" + w/2 +  "," + h/2 + ")";

    svgGroup = vis.append("g").attr('transform', transform);

    var symbolData = data.symbols,
        symbol = null,  // d3 symbol selection
        text = null,    // d3 text selection
        symbols = { // data binding
                    "text": [],
                    "circles": [],
                    "rectangles": [],
                    "polygons": [],
                    "shapes": []
                  };

    // separate shapes from text labels
    symbolData.forEach(function(symbol) {
      if(!symbol.location) {
          symbol.location = {};
          symbol.location.x = xScale(0);
          symbol.location.y = yScale(0);
      } else {
        // console.log('starting with', symbol.location.x, symbol.location.y);
        symbol.location.x = xScale(symbol.location.x);
        symbol.location.y = yScale(symbol.location.y);
        // console.log('becomes', symbol.location.x, symbol.location.y);
      }

      // for polygons, scale the points accordingly
      if(symbol.shape == "polygon") {
        for(var i = 0; i < symbol.points.length; i++) {
          if(i % 2 === 0) {// x
            symbol.points[i] = xScale(symbol.points[i]);
          } else {
            symbol.points[i] = yScale(symbol.points[i]);
          }
        }
      }

      if(symbol.shape == "text") {
        symbols.text.push(symbol);
      } else {
        symbols.shapes.push(symbol);
      }
    });



    /*
     *    L A B E L S
     */

    // draw text labels
    text = svgGroup.selectAll(".text")
      .data(symbols.text)
      .enter().append('g').attr('class', 'textLabel');

    text  // add text itself
        .append('svg:text')
        .attr('class', 'text')
        .attr('x', function(d) {
          if(d.location) return d.location.x;
          return 0;
        })
        .attr('y', function(d) {
          if(d.location) return d.location.y;
          return 0;
        })
        .attr("text-anchor", "middle")          //  Draw centered on given location
        .attr("alignment-baseline", "middle")   //  (or 0,0)
        .style('fill', function(d) {
          if(d.fill) return BridgesVisualizer.getColor(d.fill);
          return 'black';
        })
        .style('opacity', function(d) {
          if(d.opacity) return d.opacity;
          return 1;
        })
        .style("font-size", function(d) {
          if(d['font-size']) return d['font-size'] + "px";
          return "12px";
        })
        .text(function(d) {
          return d.name || "";
        });

    text // then draw rectangles around each textbox
      .append("svg:rect")
        .attr('x', function(d) {
          return d3.select(this.parentNode).select('.text').node().getBBox().x-(d['stroke-width'] || 1);
        })
        .attr('y', function(d) {
          return d3.select(this.parentNode).select('.text').node().getBBox().y-(d['stroke-width'] || 1);
        })
        .attr('width', function(d) {
          return d3.select(this.parentNode).select('.text').node().getBBox().width+(2 * (d['stroke-width'] || 1));
        })
        .attr('height', function(d) {
          return d3.select(this.parentNode).select('.text').node().getBBox().height+(2 * (d['stroke-width'] || 1));
        })
        .style("stroke-width", function(d) {
            return d['stroke-width'] || 1;
        })
        .style("stroke", function(d) {
            return BridgesVisualizer.getColor(d.stroke) || "white";
        })
        .style("stroke-dasharray", function(d) {
            return d['stroke-dasharray'] || 0;
        })
        .style("fill", "none");


    // draw and style all shapes
    shapes = svgGroup.selectAll(".shape")
      .data(symbols.shapes).enter().append("g")
        .attr("class", "shape")
      .each(function(d) {
        var me = d3.select(this);
        switch(d.shape) {
          /*
           * C I R C L E
           */
          case "circle":
            me
            .append("svg:circle")
            .attr("r", function(d) {
              return d.r || 15;
            })
            .attr("cx", function(d) {
              if(d.location)
                return d.location.x;
              return 0;
            })
            .attr("cy", function(d) {
              if(d.location)
                return d.location.y;
              return 0;
            });
            break;
          /*
           * R E C T A N G L E
           */
          case "rect":
            me
            .append("svg:rect")
              .attr("x", function(d) {
                if(d.location)
                  return d.location.x - (d.width / 2);
                return 0 - (d.width / 2);
              })
              .attr("y", function(d) {
                if(d.location)
                  return d.location.y - (d.height / 2);
                return 0 - (d.height / 2);
              })
              .attr("width", function(d) {
                return d.width || 10;
              })
              .attr("height", function(d) {
                return d.height || 10;
              });
              break;
          /*
           * P O L Y G O N
           */
           case "polygon":
             me
             .append("svg:polygon")
               .attr("points", function(d) {
                 return d.points;
               })
               .attr("transform", function(d) {
                 if(d.location)
                   return "translate(" + d.location.x +  "," + d.location.y + ")";
                 return "translate(0,0)";
               });
        }
      });

    shapes
      .style('opacity', function(d) {
        if(d.opacity) return d.opacity;
        return 1;
      })
      .style("stroke-width", function(d) {
          return d['stroke-width'] || 1;
      })
      .style("stroke", function(d) {
          return BridgesVisualizer.getColor(d.stroke) || "white";
      })
      .style("stroke-dasharray", function(d) {
          return d['stroke-dasharray'] || 0;
      })
      .style("fill", function(d) {
          return BridgesVisualizer.getColor(d.fill) || "blue";
      })
      .on("mouseover", function(d) {
          BridgesVisualizer.textMouseover(d.name);
      })
      .on("mouseout", BridgesVisualizer.textMouseout);

    // shape labels
    shapes
        .append("text")
        .attr("class","nodeLabel")
        .text(function(d) {
            return d.name;
        });


    // d3.selectAll(".nodeLabel").each(BridgesVisualizer.insertLinebreaks);


    // Handle doubleclick on node path (shape)
    function dblclick(d) {

    }

    // Handle dragstart on force.drag()
    function dragstart(d) {

    }

    function dragged(d) {

    }

    function dragended(d) {

    }

    return graph;
};
