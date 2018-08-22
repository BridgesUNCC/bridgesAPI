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
    //
    // var zoom = d3.zoom()
    //     .scaleExtent([0.1,10])
    //     .on("zoom", zoomed);

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
                    "polygons": []
                  };

    // separate shapes from text labels
    symbolData.forEach(function(symbol) {
      if(symbol.shape == "text") {
        symbols.text.push(symbol);
      } else if(symbol.shape == "circle") {
        symbols.circles.push(symbol);
      } else if(symbol.shape == "rect") {
        symbols.rectangles.push(symbol);
      } else if(symbol.shape == "polygon") {
        symbols.polygons.push(symbol);
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
        .attr("text-anchor", "middle")
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


    /*
     *    S H A P E S
     */

    circles = svgGroup.selectAll(".circle")
      .data(symbols.circles)
      .enter().append("g")
        .attr("class", "shape")
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

    rectangles = svgGroup.selectAll(".rectangle")
      .data(symbols.rectangles)
      .enter().append("g")
        .attr("class", "shape")
        .append("svg:rect")
          .attr("x", function(d) {
            if(d.location)
              return d.location.x;
            return 0;
          })
          .attr("y", function(d) {
            if(d.location)
              return d.location.y;
            return 0;
          })
          .attr("width", function(d) {
            return d.width || 10;
          })
          .attr("height", function(d) {
            return d.height || 10;
          });

    polygons = svgGroup.selectAll(".polygon")
      .data(symbols.polygons)
      .enter().append("g")
        .attr("class", "shape")
        .append("svg:polygon")
          .attr("points", function(d) {
            return d.points;
          })
          .attr("transform", function(d) {
            if(d.location)
              return "translate(" + d.location.x +  "," + d.location.y + ")";
            return "translate(0,0)";
          });

    // apply style properties to all shapes
    shapes = d3.selectAll(".shape");
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
          return BridgesVisualizer.getColor(d.fill) || "black";
      })
      .on("mouseover", function(d) {
          BridgesVisualizer.textMouseover(d.name);
      })
      .on("mouseout", BridgesVisualizer.textMouseout);

    //inner nodes
    shapes
        .append("text")
        .attr("class","nodeLabel")
        // .attr("x", BridgesVisualizer.textOffsets.graph.x)
        // .attr("y",  BridgesVisualizer.textOffsets.graph.y)
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
