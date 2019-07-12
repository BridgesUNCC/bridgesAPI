var gl,
    zoomFactorLoc,
    transl_x = 0.0,
    transl_y = 0.0,
    translXLoc,
    translYLoc,
    indexBuffer,
    edges,
    vertices,
    range,
    vertex_colors,
    edge_colors,
    cBuffer,
    ecBuffer,
    edge_indices;

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

    // Only continue if WebGL is available and working
    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    // set canvas width and height
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

    // evaluate vertices from JSON
    vertices = data.nodes;

    // evaluate color for each vertex
    vertex_colors = [];
    for (i = 0; i < vertices.length; i++) {
      // vertex_colors.push(vertices[i].color[0]/256);
      // vertex_colors.push(vertices[i].color[1]/256);
      // vertex_colors.push(vertices[i].color[2]/256);
      // vertex_colors.push(vertices[i].color[3]);
      vertex_colors.push(vertices[i][1][0]/256);
      vertex_colors.push(vertices[i][1][1]/256);
      vertex_colors.push(vertices[i][1][2]/256);
      vertex_colors.push(vertices[i][1][3]);
    }

    // evaluate range from JSON
    // var xrange = d3.extent(vertices, function(d) { return d.location[0]; });
    // var yrange = d3.extent(vertices, function(d) { return d.location[1]; });
    var xrange = d3.extent(vertices, function(d) { return d[0][0]; });
    var yrange = d3.extent(vertices, function(d) { return d[0][1]; });
    range = [
        xrange[0], xrange[1],
        yrange[0], yrange[1]
    ];

  	// convert world coords to NDC
  	var vert_ndc = [];
  	var k = 0;
  	for (i = 0; i < vertices.length; i++) {
  		// vert_ndc[i] = worldToNDC(vertices[i].location, [range[0], range[2]], [range[1], range[3]]);
      vert_ndc[i] = worldToNDC(vertices[i][0], [range[0], range[2]], [range[1], range[3]]);
  	}

    // Load the vertex colors and locations into buffers
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vert_ndc), gl.STATIC_DRAW);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertex_colors), gl.STATIC_DRAW);


    // evaluate edges from JSON
    edges = data.links;

    // get vertex locations from edges
    edge_ndc = [];
    edge_colors = [];
    for(i = 0; i < edges.length; i++) {
      var edge = edges[i];
      // var s = vert_ndc[edge.source];
      // var t = vert_ndc[edge.target];
      // edge_ndc.push(s); // push x, y for source vertex
      // edge_ndc.push(t); // push x, y for target vertex
      //
      // // add color for source vertex
      // edge_colors.push(edge.color[0]/256);
      // edge_colors.push(edge.color[1]/256);
      // edge_colors.push(edge.color[2]/256);
      // edge_colors.push(edge.color[3]);
      // // add color for target vertex
      // edge_colors.push(edge.color[0]/256);
      // edge_colors.push(edge.color[1]/256);
      // edge_colors.push(edge.color[2]/256);
      // edge_colors.push(edge.color[3]);
      edge_ndc.push(vert_ndc[edge[0]]);
      edge_ndc.push(vert_ndc[edge[1]]);
      edge_colors.push(edge[2][0]/256);
      edge_colors.push(edge[2][1]/256);
      edge_colors.push(edge[2][2]/256);
      edge_colors.push(edge[2][3]);
      edge_colors.push(edge[2][0]/256);
      edge_colors.push(edge[2][1]/256);
      edge_colors.push(edge[2][2]/256);
      edge_colors.push(edge[2][3]);
    }

    // Load the edge colors and locations into buffers
    eBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, eBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(edge_ndc), gl.STATIC_DRAW);

    ecBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ecBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(edge_colors), gl.STATIC_DRAW);


    // Set up Position and Color shader attributes
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

  	gl.getExtension('OES_element_index_uint');

    // initialize uniforms
    zoomFactorLoc = gl.getUniformLocation(program, "zoom_factor");
    translXLoc = gl.getUniformLocation(program, "transl_x");
    translYLoc = gl.getUniformLocation(program, "transl_y");

  	render();

    return graph;
};

// draw loop
function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );

	// pass the zoom factor to the GPU
	gl.uniform1f(zoomFactorLoc, zoom_factor);
	gl.uniform1f(translXLoc, transl_x);
	gl.uniform1f(translYLoc, transl_y);

  /*
      E D G E S
  */
  // bind vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, eBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // bind edge colors
  gl.bindBuffer(gl.ARRAY_BUFFER, ecBuffer);
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // draw the edges
  gl.drawArrays(gl.LINES, 0, edges.length*2);

  /*
      V E R T I C E S
  */
  // bind vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // bind vertex colors
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // draw the vertices
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
