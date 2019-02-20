var gl,
    zoomFactorLoc,
    transl_x = 0.0,
    transl_y = 0.0,
    translXLoc,
    translYLoc,
    indexBuffer;

d3.graph_webgl = function(canvas, W, H, data) {

    gl = WebGLUtils.setupWebGL( canvas.node() );
  	if (!gl) {
  		alert( "WebGL isn't available" );
  	}

    // fragment shader
    const fsSource = `
    precision mediump float;

    varying vec4 fColor;

    void main() {
      gl_FragColor = fColor;
    }
    `;

    // vertex shader
    const vsSource = `
    attribute vec4 vPosition;
    attribute vec4 vColor;
    uniform float zoom_factor;
    uniform float transl_x;
    uniform float transl_y;
    varying vec4 fColor;

    void main() {
      gl_PointSize = 5.0;
      gl_Position.x = vPosition.x * zoom_factor + transl_x;
      gl_Position.y = vPosition.y * zoom_factor + transl_y;
      gl_Position.z = 0.0;
      gl_Position.w = 1.0;

			// pass the vertex color to fragment shader
  	  fColor = vColor;
    }
    `;

    //defaults
    var graph = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0;
        // edgeLength = d3.scaleLinear().domain([1,1000]).range([100,250]),
        // fixedNodeCount = 0,
        // scale = [1.0,1.0,0.0,0.0],
        // translate = [0.0, 0.0, -5.0];

    // Only continue if WebGL is available and working
    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    canvas.attr("width", w).attr("height", h);

    // set up zoom handler
    var zoom = d3.zoom().on("zoom", zoomed);
  	function zoomed () {
  		zoom_factor = d3.event.transform.k;
  		coords = deviceToNDC([d3.event.transform.x, d3.event.transform.y]);

  		transl_x = coords[0];
  		transl_y = coords[1];

      window.requestAnimationFrame(render);
    }

  	// bind zoom behavior to the canvas
  	canvas.call(zoom);

    graph.reset = function() {
      canvas.call(zoom.transform, d3.zoomIdentity.translate(gl.canvas.width/2, gl.canvas.height/2));
    };
    graph.reset();

    gl.canvas.width = w;
    gl.canvas.height = h;

    //
  	//  Configure WebGL
  	//
  	gl.viewport( 0, 0, gl.canvas.width, gl.canvas.height );
  	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaderProgram(gl, vsSource, fsSource);
  	gl.useProgram( program );

  	// convert world coords to NDC
  	var vert_ndc = [];
  	var k = 0;
  	for (i = 0; i < vertices.length; i++) {
  		vert_ndc[i] = worldToNDC(vertices[i], [range[0], range[2]], [range[1], range[3]]);
  	}

    // Load the data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vert_ndc), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_colors), gl.STATIC_DRAW);

  	edge_colors = new Float32Array(vertices.length);
  	for (i = 0; i < edges.length; i +=4) {
  		edge_colors[i] = 0.0; //255.0;
  		edge_colors[i+1] = 255.0;
  		edge_colors[i+2] = 0.0;
  		edge_colors[i+3] = 1.0;
  	}

    // Associate shader variables with our data buffer
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

  	// create the indices into the vertex buffer
  	indexBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(flatten(edges)), gl.STATIC_DRAW);

  	gl.getExtension('OES_element_index_uint');

    // initialize uniforms
    zoomFactorLoc = gl.getUniformLocation(program, "zoom_factor");
    translXLoc = gl.getUniformLocation(program, "transl_x");
    translYLoc = gl.getUniformLocation(program, "transl_y");

  	render();

    return graph;
};


function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );

	//  pass the zoom factor to the GPU
	gl.uniform1f(zoomFactorLoc, zoom_factor);
	gl.uniform1f(translXLoc, transl_x);
	gl.uniform1f(translYLoc, transl_y);

	// draw the square
	gl.drawElements(gl.LINES, edges.length*2, gl.UNSIGNED_INT, indexBuffer);
	gl.drawArrays (gl.POINTS, 0, vertices.length);
}

function worldToNDC(wcoords, wc_min, wc_max) {
	var wc_width = wc_max[0]-wc_min[0];
	var wc_height = wc_max[1]-wc_min[1];
	var ndc_x = ((wcoords[0]-wc_min[0])/wc_width)*2.0 -1.0;
	var ndc_y = ((wcoords[1]-wc_min[1])/wc_height)*(2.0) -1.0 ;

  return [ndc_x, ndc_y];
}

function deviceToNDC(dev_coords) {
	var ndc_x = 2.0*dev_coords[0]/gl.canvas.width - 1.0;
	var ndc_y = 2.0*(gl.canvas.height-dev_coords[1])/gl.canvas.height - 1.0;
	return [ndc_x, ndc_y];
}
