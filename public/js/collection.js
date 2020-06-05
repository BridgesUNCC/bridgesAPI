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

	var finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
	var finalScale =  BridgesVisualizer.defaultTransforms.graph.scale;


	// 	transforming shapes - use the bounding box of the shape for the
	// 	transformation, given by data.domain
	// 	Transformation involves translating the center of the shape to 
	// 	the origin,  (Transl_Origin), then scale to the size of the bounding 
	//	box of the symbols(ScaleFactor) and translating to the viewport,
	//	(T_VP), while // maintaining the aspect ratio

	// translation to origin
	Transl_Origin = [-(data.domainX[0]+data.domainX[1])/2, -(data.domainY[0]+data.domainY[1])/2];

	// scale to the width, height of the domain
	Scale = [	w/(data.domainX[1] - data.domainX[0]), 
				h/(data.domainY[1] - data.domainY[0]) ];

	// choose the smaller of the two scale factors to maintain aspect ratio
	ScaleFactor = Math.min(Scale[0], Scale[1]);

	// add some padding
	ScaleFactor = ScaleFactor/1.1;

	// final translation to center the visualization
	Transl_VP = [w/2, h/2];
	
	// flip y -- device origin is upper left
    Y_flip = "matrix(1, 0, 0, -1, 0, 0)";

	// form the composite transform, used by the Zoom function
	var T_Comp = d3.zoomIdentity
					.translate(Transl_VP[0], Transl_VP[1])
					.scale(ScaleFactor)
					.scale(1.0, -1.0)
					.translate(Transl_Origin[0], Transl_Origin[1]);

	// same thing for the svg group
	var T_Composite = 
			"translate(" + Transl_VP[0] + "," + Transl_VP[1] + ") " + 
			"scale(" + ScaleFactor + ") " + Y_flip + " translate(" + 
			Transl_Origin[0] + "," + Transl_Origin[1] + ")";

	// initialize zoom parameters, handler
	var zoom = d3.zoom()
			.scaleExtent([0.1,5])
		.on("zoom", zoomHandler);

	// update the svg with some global attributes and zoom attribute
    vis = svg.attr("width", w)
            .attr("height", h)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + w + " " + h)
            .classed("svg-content", true)
			.call(zoom)

	// add the transformation to the svg group
	// this centers the symbols on the display
	svgGroup = vis.append("g").attr('transform', T_Composite);

	// zoom handler
	function zoomHandler() {
		if (svgGroup) {
			var T = d3.event.transform;
			svg.attr('transform', d3.event.transform);
		}
	}

	// parse and set all symbols in the shape collection
    var symbolData = data.symbols,
        symbol = null,  // d3 symbol selection
        text = null,    // d3 text selection
        symbols = { // data binding
                    "text": [],
                    "circles": [],
                    "ellipses": [],
                    "rectangles": [],
                    "polylines": [],
                    "points": [],
                    "shapes": []
                  };

    // separate shapes from text labels
    symbolData.forEach(function(symbol) {
	//setting default location is unspecified
      if(!symbol.location) {
          symbol.location = {};
          symbol.location.x = 0.0;
          symbol.location.y = 0.0;
      } 

      // complete the polygon with the original point
      if(symbol.shape == "polygon" && symbol.points && symbol.points.length >= 2) {
        symbol.points.push(symbol.points[0]);
        symbol.points.push(symbol.points[1]);
      }

      if(symbol.shape == "text") {
        symbols.text.push(symbol);
      } else {
        symbols.shapes.push(symbol);
      }
    });


    // draw and style all shapes
    shapes = svgGroup.selectAll(".shape")
      .data(symbols.shapes).enter().append("g")
        .attr("class", "shape")
      .each(function(d) {
        var me = d3.select(this);
        switch(d.shape) {
          /*
           * Circle
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
           * Point
           */
          case "point":
            me
            .append("svg:circle")
            .classed("point", true)
            .attr("r", 1)
            .attr("cx", function(d) {
              if(d.points)
                return d.points[0];
              return 0;
            })
            .attr("cy", function(d) {
              if(d.points)
                return d.points[1];
              return 0;
            });
            break;
			/*
			 * Ellipse
			 * (though they are currently not supported in BRIDGES clients)
			 */
          case "ellipse":
            me
            .append("svg:ellipse")
            .attr("rx", function(d) {
              return d.rx || 15;
            })
            .attr("ry", function(d) {
              return d.ry || 15;
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
			 * Rectangle
			 */
          case "rect":
            me
            .append("svg:rect")
              .attr("x", function(d) {
                if(d.location)
//                return d.location.x - (d.width / 2);
                  return d.location.x;
//              return 0 - (d.width / 2);
                return 0;
              })
              .attr("y", function(d) {
                if(d.location)
//                return d.location.y - (d.height / 2);
                  return d.location.y;
//                return 0 - (d.height / 2);
                return 0;
              })
              .attr("width", function(d) {
                return d.width || 10;
              })
              .attr("height", function(d) {
                return d.height || 10;
              });
              break;
			/*
			 * Polygon
			 */
           case "polygon":
           case "polyline":
           case "line":
             me
             .append("svg:polyline")
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

	// shape properties
    shapes
      .style('opacity', function(d) {
        if(d.opacity) return d.opacity;
        return 1;
      })
      .style("stroke-width", function(d) {
          if (d['stroke-width']) return d['stroke-width'];
	  return  1;
      })
      .style("stroke", function(d) {
          return BridgesVisualizer.getColor(d.stroke) || "black";
      })
      .style("stroke-dasharray", function(d) {
          return d['stroke-dasharray'] || 0;
      })
      .style("fill", function(d) {
          return BridgesVisualizer.getColor(d.fill) || "none";
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


		/*
		 *    Shape labels
		 */

    // draw text labels
    text = svgGroup.selectAll(".text")
      .data(symbols.text)
	.enter().append('g').attr('class', 'textLabel');

    text  // add text itself
        .append('svg:text')
	.attr('transform', function(d) {
	    //this is a transformation that print the text in the correct way.
	    //There is a need to flip the y axis to cancel out the cartesian mapping otherwise text get printed upside down. this is what the first 4 parameters of the call to matrix do
	    //But also there is a need to shift back the text at the right position, hence the shift base on location and font-size
	    yoffset = 0;
	    if (d.location)
		yoffset += 2*d.location.y;
	    if (d['font-size'])
		yoffset -= d['font-size']/2
	    else
		yoffset -= 6;
	    return 'matrix (1,0,0,-1,0, '+yoffset+')';
	})
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
};
