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
			.extent([[0,0], [w, h]])
			.scaleExtent([0.1,5])
		.on("zoom", zoomHandler);

	function zoomHandler(evt) {
		if (svgGroup) {
			svg.attr('transform', evt.transform);
		}
	}

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
		} 
		else {
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
				case "circle":    // Circle
					me
					.append("svg:circle")
					.attr("r", function(d) {
						if (d.r === undefined) return 15;
							return d.r;
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

				case "point":    // Point 
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

				case "ellipse":    // Ellipse: currently not supported
					me
					.append("svg:ellipse")
					.attr("rx", function(d) {
						if (d.rx === undefined) return 15;
							return d.rx;
					})
					.attr("ry", function(d) {
						if (d.ry === undefined) return 15;
							return d.ry;
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

          		case "rect":    // Rectangle
					me
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
						if (d.width === undefined) return 10;
						return d.width;
					})
					.attr("height", function(d) {
						if (d.height === undefined) return 10;
						return d.height;
					});
					break;

				case "polygon":				// Polygon
				case "polyline": 			// Polyline
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
			if(d.opacity === undefined) return 1;
				return d.opacity;
		})
		.style("stroke-width", function(d) {
		if (d['stroke-width'] === undefined) return 1;
			return d['stroke-width'];
		})
		.style("stroke", function(d) {
		if (d.stroke === undefined) return "black";
			return BridgesVisualizer.getColor(d.stroke); 
		})
	.attr("stroke-dasharray", function(d) {
	    if (d['stroke-dasharray'] === undefined) return 0;
			return d['stroke-dasharray'];
		})
		.style("fill", function(d) {
		if (d.fill === undefined) return "none";
			return BridgesVisualizer.getColor(d.fill);
		})
	.on("mouseover", function(evt, d) {
			BridgesVisualizer.textMouseover(d.name);
		})
	.on("mouseout", function(evt, d) { BridgesVisualizer.textMouseout(d);});

	// shape node names
	shapes
		.append("text")
		.attr("class","nodeLabel")
		.text(function(d) {
			return d.name;
		});


	// draw text labels
    text = svgGroup.selectAll(".text")
      .data(symbols.text)
	.enter().append('g').attr('class', 'textLabel');

	text  // add text itself
		.append('svg:text')
		.attr('transform', function(d) {
	    //this is a transformation that prints the text in the correct way.
	    //we need to do three operations.
	    //1. There is a need to flip the y axis to cancel out the cartesian mapping otherwise text get printed upside down. this is what the first 4 parameters of the call to matrix do
	    //2. The angle of rotation of the text needs to be taken into account
	    //3. The placement of the text in the space needs to be set.
	    //We do all three operations in transform because the translation needs to be the last operation done
	    //Because of that, the order in which they are specified matters. The first operation in the string is the last operation to be applied

			let dastr = "";
			if (d.location) {
				dastr = dastr +"translate("+d.location.x+" "+d.location.y+") ";
			}
			if (d.angle) {
				dastr = dastr +"rotate("+d.angle+") ";
			}
			dastr = dastr + 'matrix (1, 0, 0, -1, 0, 0)'
			return dastr;
		})
        .attr('class', 'text')
    //We do not use x and y parameter in the text attribute because we take location into account in the transformation of the text.
    //We do that to make the transform code easier becasue it needs to do a couple of axis flipping and rotation
//        .attr('x', function(d) {
//          if(d.location) return d.location.x;
//          return 0;
//        })
//        .attr('y', function(d) {
//          if(d.location) return d.location.y;
//          return 0;
//        })
    
		.attr("text-anchor", "middle")  //  Draw centered on given location along x-axis
		.attr("dominant-baseline", "middle")    //  Draw centered on given location along y-axis. This makes the coordinate we use be the center of the text (in between the two line in an elementary writing class). Beware that there is an other parameter alignment-baseline that does not do what we want.

		//The fill of a label is actually the primary color of the text. 
		// That's what you would normally think of as "font color"
		.style('fill', function(d) {
			if(d.fill === undefined) return 'black';
			return BridgesVisualizer.getColor(d.fill);
		})
		.style('opacity', function(d) {
			if(d.opacity) return d.opacity;
			return 1;
		})
		.style("font-size", function(d) {
			if(d['font-size'] === undefined) return "12px";
			return d['font-size'] + "px";
		})
		//The stroke on a label is the outline of the label. so typically one would want the stroke width to be very small
		.style("stroke-width", function(d) { 
		if (d['stroke-width'] === undefined) return 1;
			return d['stroke-width'];
		})
		.style("stroke", function(d) {
			if (d.stroke === undefined) return "black";
			return BridgesVisualizer.getColor(d.stroke); 
		})
	.attr("stroke-dasharray", function(d) {
		if (d['stroke-dasharray'] === undefined) return 0;
			return d['stroke-dasharray'];
		})
		.text(function(d) {
		if (d.name === undefined) return "";
			return d.name;
		});



		// d3.selectAll(".nodeLabel").each(BridgesVisualizer.insertLinebreaks);


		// Handle doubleclick on node path (shape)
    function dblclick(evt, d) {
		}

		// Handle dragstart on force.drag()
		function dragstart(evt, d) {
		}

		function dragged(evt, d) {
		}

		function dragended(evt, d) {
		}
};
