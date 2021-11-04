//based loosely on bostock's example and
//http://bl.ocks.org/d3noob/5141278

// Symbol collection: structure and  attributes

// Each symbol consists of a set of mandatory and optional attributes; optional
// attributes maybe assignmed a default value 

// Symbol JSON structure:
//"symbols: [ 
//    {"id:   :  int,   // mandatory
//     "parent" : int,  // optional, group has a parent id, highest level symbols dont
//     "type" :  string,// mandatory, can be 'line', 'circle', 'rect', 'text' etc.
//     "layer":  int,   // optional, represents the depth of object, used for 
//					  //  rendering order. lower values are closer to the camera
//     "transform": 3x3 float // optional, represents 2D transform of symbol/group
//     "stroke-color": [r,g,b,a] // optional
//     "stroke-width": float // optional
//     "stroke-dasharray": int // optional, does not provide the full dash array feature
//     "fill-color": string // optional -- not can take rgba
//     "opacity":  float    // range 0-1
//     "label" : string     // for mouse over, etc
//     // symbol types and their properties
//     "circle" :   
//          "center":  float[2]
//          "radius":  float
//	 "rect": 
//          "lowerleftcorner":  float[2],
//          "width":  float,
//          "height":  float,
//     "text": 
//           "text": string    // text of the label
//           "font-size": int
//           "anchor-location": float[2]
//           "anchor-alignmentLR": string //valid "left", "middle", and "right" // optional
//           "anchor-alignmentTB": string //valid "top", "bottom", "embottom", "emtop", "middle" // optional
//     "polyline":
//           "points" : [.....]  // set of x,y pairs in float
//     "polygon":
//           "points" : [.....]  // set of x,y pairs in float
//           
//       },
//	   {
//         "id: int,
//         ........
//         ........
//         ........
//       }
//       ......
//       ......
//      ]
//

d3.collectionv2 = function(svg, W, H, data) {

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


    var sourceSymbols = data["symbols"]
    //    console.log("symbols are "+ JSON.stringify(sourceSymbols));

    //create dictionary of symbols that associate ID to symbol
    var symbolDict = {};
    for (const symb of sourceSymbols) {
	symbolDict[symb["ID"]] = symb;

	symbolDict[symb["ID"]]["children"] = [];
    }

    var symbolRoot = []
    
    //recreate hierarchy
    for (var id in symbolDict) {
	if ("parentID" in symbolDict[id]) {
	    parentID = symbolDict[id]["parentID"];
	    symbolDict[ parentID ]["children"].push(id);
	}
	else {
	    symbolRoot.push(id);
	}
    }

    console.log("symbolDict "+ JSON.stringify(symbolDict));
    console.log("root: "+ JSON.stringify(symbolRoot));

    //TODO: sort children list and root by layer.
    var sortlayers = function(arr) {
	arr.sort(function(a, b) {
	    var alayer=0
	    var blayer=0
	    
	    if ('layer' in symbolDict[a]) 
		alayer = symbolDict[a]['layer']
	    
	    if ('layer' in symbolDict[b]) 
		blayer = symbolDict[b]['layer']
	    
	    return blayer - alayer ;
	});
    };

    sortlayers(symbolRoot);
    for (var id in symbolDict) {
	sortlayers(symbolDict[id]['children'])
    }    
    
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
			.scaleExtent([.01, 100])
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
    svgZoomGroup = vis.append("g")
    svgGroup = svgZoomGroup.append("g").attr('transform', T_Composite)

	// zoom handler
	function zoomHandler() {
		if (svgZoomGroup) {
			var T = d3.event.transform;
			svgZoomGroup.attr('transform', T);
		}
	}

    var helper = function (svgElement, IDarray) {
	for (var id of IDarray) {
	    var symb = symbolDict[id];
	    var symbSVG = null;

	    var transformString = ""; 		//some off the trans may come from different places
	    
	    if (symb["type"] === "rect" ) {
		//console.log("rect is "+JSON.stringify(symb));
		symbSVG =
		    svgElement.append('rect')
		    .attr('x', symb["lowerleftcorner"][0])
		    .attr('y', symb["lowerleftcorner"][1])
		    .attr('width', symb["width"])
		    .attr('height', symb["height"]);
	    } else if (symb["type"] === "circle" ) {
		//console.log("circle is "+JSON.stringify(symb));
		symbSVG =
		    svgElement.append('circle')
		    .attr('cx', symb["center"][0])
		    .attr('cy', symb["center"][1])
		    .attr('r', symb["r"]);		
	    } else if (symb["type"] === "text" ) {
		//console.log("text is "+JSON.stringify(symb));

		transformString = "translate("+ symb['anchor-location'][0] + ", "+ symb['anchor-location'][1]+")"
		transformString = transformString + " scale(1,-1)"
		symbSVG =
		    svgElement.append('text')
		    .text(symb['text'])
		    .attr('font-size', symb['font-size'])
		if ("anchor-alignmentLR" in symb) {
		    var ta = ""
		    if (symb['anchor-alignmentLR'] == 'left')
			ta = 'start'
		    if (symb['anchor-alignmentLR'] == 'right')
			ta = 'end'
		    if (symb['anchor-alignmentLR'] == 'middle')
			ta = 'middle'
		    symbSVG.attr('text-anchor', ta)
		}
		if ("anchor-alignmentTB" in symb) {
		    var db = ""
		    if (symb['anchor-alignmentTB'] == 'top')
			db = 'text-before-edge'
		    if (symb['anchor-alignmentTB'] == 'emtop')
			db = 'mathematical'
		    if (symb['anchor-alignmentTB'] == 'middle')
			db = 'middle'
		    if (symb['anchor-alignmentTB'] == 'embottom')
			db = 'alphabetic'
		    if (symb['anchor-alignmentTB'] == 'bottom')
			db = 'ideographic'
		    symbSVG.attr('dominant-baseline', db)
		}
		
	    } else if (symb["type"] === "polyline" ) {
		//console.log("polyline is "+JSON.stringify(symb));
		symbSVG =
		    svgElement.append('svg:polyline')
		    .attr("points", symb["points"]);
	    } else if (symb["type"] === "polygon" ) {
		//console.log("polygon is "+JSON.stringify(symb));
		var points = symb["points"];
		points.push(points[0]);
		points.push(points[1]);
		symbSVG =
		    svgElement.append('svg:polyline')
		    .attr("points", points);
	    } else if (symb["type"] === "group" ) {
		console.log("group is "+JSON.stringify(symb));
		symbSVG =
		    svgElement.append('g');
		helper(symbSVG, symb['children']);

	    } 
	    
	    
	    //add generic parameters
	    if (!(symbSVG === null)) {
		if ("fill-color" in symb) {
		    symbSVG.attr('fill', BridgesVisualizer.getColor(symb["fill-color"]));
		} 

		if ("stroke-color" in symb) {
		    symbSVG.attr('stroke', BridgesVisualizer.getColor(symb["stroke-color"]));
		}
		
		if ("stroke-width" in symb) {
		    symbSVG.attr('stroke-width', 1*symb["stroke-width"]);
		}

		if ("stroke-dasharray" in symb) {
		    symbSVG.attr('stroke-dasharray', 1*symb["stroke-dasharray"]);
		}
		
		if ("opacity" in symb) {
		    symbSVG.attr('opacity', symb["opacity"]);
		}
		
		if ("transform" in symb) {
		    transformString = "matrix("
				 +(symb["transform"][0])+","
				 +(symb["transform"][1])+","
				 +(symb["transform"][2])+","
				 +(symb["transform"][3])+","
				 +(symb["transform"][4])+","
			+(symb["transform"][5])+") " + transformString 
				 
		}

		if (transformString != "") {
	            symbSVG.attr("transform", transformString)
		}
	    }
	}
    };

    helper(svgGroup, symbolRoot);

};
