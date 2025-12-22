//
// Grid visualization abstraction for Bridges
//
// Last Modified 08/06/25 (KRS)
//
d3.grid = function(canvas, W, H, data, parent) {
	var context = canvas.node().getContext("2d");

    var return_me = {};

        
	//defaults
	var grid = [],
		w = W || 1280,
		h = H || 800,
		nodes = [];

	// set up data dimensions
	var dims = data.dimensions;

    function setDimensions() {
	// if more rows than cols
	if (dims[0] > dims[1]) {
	    nodeSize = parseInt((h) / dims[0]);
	}
	else {
	    nodeSize = Math.min(parseInt((w)/dims[1]), parseInt((h)/dims[0]));
	}
	nodeSize = Math.max(nodeSize, 1);
	
	w = dims[1] * nodeSize;
	h = dims[0] * nodeSize;

	// set canvas attrs
	canvas.attr("width", w + 'px').attr("height", h + 'px');
    }
    
    setDimensions();
    
	parent.style("width", w + 'px')
		.style("height", h + 'px')
	.style("margin", "auto");
    
	// if necessary, modify assignmentSlide nav menu
	d3.select("#assignmentSlide")
		.style("width", w + 'px')
		.style("padding-bottom", '15px')
		.style("margin", "auto");




    
	// set up nodes
	if (!data.encoding || data.encoding == "RAW") {
		rgbaArray = Uint8Array.from(atob(data.nodes), function(c) {
			return c.charCodeAt(0);
		});
		for (var i = 0; i < rgbaArray.length; i += 4) {
			nodes.push(rgbaArray.slice(i, i + 4));
		}
	}
	else if (data.encoding == "RLE") {
		byteArray = Uint8Array.from(atob(data.nodes), function(c) {
			return c.charCodeAt(0);
		});
		// iterate over each 5-tuple
		for (var i = 0; i < byteArray.length; i += 5) {
			for (var j = 0; j <= byteArray[i]; j++) {
				nodes.push(byteArray.slice(i + 1, i + 5));
			}
		}
	}


    return_me.resize = function() {
	var width = d3.select(".assignmentContainer").style("width"),
	    height = d3.select(".assignmentContainer").style("height");
	width = width.substr(0, width.indexOf("px"));
	height = height.substr(0, height.indexOf("px"));
	
	canvas.attr("width", width).attr("height", height);

	h=height;
	w=width;

	setDimensions();
	
	draw();
    }
    
	// set up draw method from requestAnimationFrame
	function draw() {
		nodes.forEach(drawNode);
	}

	// draw a node of the grid
	function drawNode(d, i) {
		context.fillStyle = "rgba(" + d[0] + "," + d[1] + "," + d[2] + "," + (d[3] / 255) + ")";
		context.fillRect(parseInt(i % dims[1])*nodeSize, parseInt(i / dims[1])*nodeSize, nodeSize, nodeSize);
	}

	function _base64ToArrayBuffer(base64) {
		var binary_string =  window.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array( len );
		for (var i = 0; i < len; i++)        {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}

    draw();

    return return_me;
};
