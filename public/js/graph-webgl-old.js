d3.graph_webgl = function(canvas, W, H, data) {

    // console.log(data.clt);

    var gl = canvas.node().getContext("webgl");

    const fsSource = `
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
      }
    `;

    const vsSource = `
      attribute vec4 aVertexPosition;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `;

    //defaults
    var graph = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0,
        edgeLength = d3.scaleLinear().domain([1,1000]).range([100,250]),
        fixedNodeCount = 0,
        scale = [1.0,1.0,0.0,0.0],
        translate = [0.0, 0.0, -5.0];

    // Only continue if WebGL is available and working
    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    canvas.attr("width", w).attr("height", h);

    // bind zoom and pan listener to update scene
    canvas.call(d3.zoom().on("zoom", function () {
      oldscale = scale[0];

      scale[0] = scale[1] = d3.event.transform.k;

      var cx = d3.event.sourceEvent.clientX,
          cy = d3.event.sourceEvent.clientY,
          dx = cx - (w/2),
          dy = cy - (h/2);

      // scalechange = scale[0] - oldscale;
      // translate[0] = -(dx * scalechange);
      // translate[1] = (dy * scalechange);

      console.log(dx, dy);
      console.log(scale, translate);

      window.requestAnimationFrame(drawScene);
    }));

    gl.canvas.width = w;
    gl.canvas.height = h;

    // Set clear color to grey, fully opaque
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // set up shaders
     const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

     const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
        },
      };

    // initialize vertex buffer
    const buffers = initBuffers(gl);


    // perspective matrix
    const fieldOfView = Math.PI * 0.25;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 10.0;
    const projectionMatrix = mat4.create();
    // create mv matrix
    // const modelViewMatrix = mat4.create();


    // function drawScene(gl, programInfo, buffers) {
    function drawScene() {

      // specify window dimensions
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // clear the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // update perspective
      mat4.perspective(projectionMatrix,
                       fieldOfView,
                       aspect,
                       zNear,
                       zFar);

      const modelViewMatrix = mat4.create();

      // translate the model view
      mat4.translate(modelViewMatrix,     // destination matrix
                     modelViewMatrix,     // matrix to translate
                     translate);

      // scale the model view
      mat4.scale(modelViewMatrix,     // destination matrix
                  modelViewMatrix,     // matrix to translate
                  scale);

      // Specify data access in buffer
      {
        const numComponents = 2;  // values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
      }

      // Tell WebGL to use our program when drawing
      gl.useProgram(programInfo.program);

      // Set the shader uniforms
      gl.uniformMatrix4fv(
          programInfo.uniformLocations.projectionMatrix,
          false,
          projectionMatrix);
      gl.uniformMatrix4fv(
          programInfo.uniformLocations.modelViewMatrix,
          false,
          modelViewMatrix);

      {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.LINES, offset, vertexCount);
      }
    }
    drawScene();

    function initBuffers(gl) {
      // Create a buffer for the square's positions.
      const positionBuffer = gl.createBuffer();

      // bind positions
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // const positions = [];
      //
      // for(var i = 0; i < 100; i++) {
      //   positions.push(Math.random());
      //   positions.push(Math.random());
      //   positions.push(Math.random());
      //   positions.push(Math.random());
      // }

      const positions = [
        -0.9, -0.9,
        -0.9, 0.9,

        0.9, -0.9,
        0.9, 0.9
      ];


      // put positions in buffer
      gl.bufferData(gl.ARRAY_BUFFER,
                    new Float32Array(positions),
                    gl.STATIC_DRAW);

      return {
        position: positionBuffer,
      };
    }

    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    function initShaderProgram(gl, vsSource, fsSource) {
      const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

      // Create the shader program
      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      // If creating the shader program failed, alert
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }

      return shaderProgram;
    }

    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    function loadShader(gl, type, source) {
      const shader = gl.createShader(type);

      // Send the source to the shader object
      gl.shaderSource(shader, source);

      // Compile the shader program
      gl.compileShader(shader);

      // See if it compiled successfully
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }


    return graph;
};
