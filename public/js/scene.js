var gl;
var u_color;
// var ground;
var u_view_point, u_projection_point;
// var u_view_lamp, u_projection_lamp;
var canvas;
var now, dt;
var vertex_buffer, color_buffer, line_buffer, line_color_buffer;
var dragging;
var oldx, x, oldy, y;

var box;
var oldx, x, oldy, y;
var prevX, prevY = 0;
var pitch = 0.0;
var yaw = -90.0;
var xpos = 0.0;
var ypos = 1.0;
var zpos = 1.0;
var dx= 0, dy = 0;
var forwardX = 0;
var forwardZ = 0;
var bobs = 0.2;
var vBufferId, indexBuffer;
var keyState = {};
var cube, cubeLight, light, lamp;
var wall, wall2, wall3, wall4, flat, flat2, gun;
var slider, sliderRho, mousexNDC, mouseyNDC;
// var at = vec3(0.0, 0.0, -1.0);
// var eye = vec3(0.0, 1.0, 1.0);
var currentFrame, delta;
var fps = 60;
var interval = 1000/fps;
var then = Date.now();
var reverseLightDirectionLocation;
var lightWorldPositionLocation;
var viewPosition, shininessLocation, lightColorLocation, specularColorLocation;
var pointlightShader, lampShader, currentShader;
var eye, at, front, right;
var vertices, mesh, objectList = [];
var objectListDesc = [];

d3.scene_webgl = function(canvas, W, H, data){

  var bridges_scene = {};
  var meshes = [];

    //vertices = data["meshes"][0]["vertices"];
    front = vec3(0.0, 0.0, -1.0);
    at = vec3(0.0, 0.0, -1.0);
    eye = vec3(0.0, 0.0, 1.0);
    right = vec3(1.0, 0.0, 0.0);

    // fragment shader
    const fsSource = `
    precision mediump float;
  	varying vec3 v_normal;
  	varying vec3 v_surfaceToLight;
  	varying vec3 v_surfaceToView;
  	varying vec2 v_texcoord;

  	uniform vec4 u_color;
  	uniform vec3 u_lightColor;
  	uniform vec3 u_specularColor;
  	uniform float u_shininess;
  	uniform sampler2D u_texture;


  	void main(){
    		// because v_normal is a varying it's interpolated
    		// so it will not be a unit vector. Normalizing it
    		// will make it a unit vector again
    		vec3 normal = normalize(v_normal);

    		vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    		vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    		vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  			//distance from object surface to light for attenuation
  			float surfaceToLightDistance = length(v_surfaceToLight);

    		float light = dot(normal, surfaceToLightDirection);

  			//get the specular highlight value
    		float specular = 0.0;
    		if(light > 0.0){
    			specular = pow(dot(normal, halfVector), u_shininess);
    		}

  			//calculate the attenuation of the light using the distance from the
  			//objects surface to the light clamping between 0.0 and 1.0 amd apply
  			//to the color of the object http://learnwebgl.brown37.net/09_lights/lights_attenuation.html
  			float attenuation = clamp(0.5 / surfaceToLightDistance, 0.0, 1.0);

  			gl_FragColor = u_color + texture2D(u_texture, v_texcoord);
  			// gl_FragColor = texture2D(u_texture, gl_PointCoord);


    		//Lets multiply just the color portion (not the alpha)
    		//by the light
    		gl_FragColor.rgb *= light * u_lightColor;

    		//Just add in the specular
    		gl_FragColor.rgb += specular * u_specularColor;

  			//add the attenuation factor
  			gl_FragColor.rgb *= attenuation;
  	}
    `;

    // vertex shader
    const vsSource = `
    attribute vec3 coordinates;
  	attribute vec3 a_normal;
  	attribute vec2 a_texcoord;

  	uniform mat4 u_model;
  	uniform mat4 u_view;
  	uniform mat4 u_projection;
  	uniform vec3 u_lightPosition;
  	uniform vec3 u_viewPosition;

  	varying vec3 v_normal;
  	varying vec3 v_surfaceToLight;
  	varying vec3 v_surfaceToView;
  	varying vec2 v_texcoord;

  	void main(){
  		vec4 position = vec4(u_projection * u_view * u_model * vec4(coordinates, 1.0));
  		gl_Position = position;
  		gl_PointSize = 20.0;
  		vec3 surfaceWorldPosition = (u_model * vec4(coordinates, 1.0)).xyz; //position of the primitives surface
  		v_normal = mat3(u_model) * a_normal;
  		v_surfaceToLight = u_lightPosition - surfaceWorldPosition; //direction vector from light to surface of primitive
  		v_surfaceToView = u_viewPosition - surfaceWorldPosition; //direction vector from view to surface of primitive
  		v_texcoord = a_texcoord;
  	}
    `;

    // vertex shader source code
   var vertCode =`
   attribute vec3 coordinates;
   attribute vec3 a_normal;

   uniform mat4 u_model;
   uniform mat4 u_view;
   uniform mat4 u_projection;

   varying vec3 v_normal;

   void main(void) {
     vec4 position = vec4(u_projection * u_view * u_model *  vec4(coordinates, 1.0));
     v_normal = a_normal;
     gl_Position = position;
      //gl_PointSize = 10.0;
   }`;

   var fragCode =`
   precision highp float;
   varying vec3 v_normal;

   uniform vec3 u_reverseLightDirection;
   uniform vec4 u_color;
   void main(void) {
     vec3 normal = normalize(v_normal);

     float light = dot(normal, u_reverseLightDirection);

     gl_FragColor = u_color;

     // Lets multiply just the color portion (not the alpha)
     // by the light
     gl_FragColor.rgb *= light;
   }`;

    canvas = document.getElementById("canvas_webgl0");
    // gets the main canvas for the main wave
    gl = WebGLUtils.setupWebGL(document.getElementById("canvas_webgl0"));

    if (!gl) { alert("WebGL isn't available"); }

    gl.canvas.width = W;
    gl.canvas.height = H;

    // Configure WebGL
    box = gl.canvas.getBoundingClientRect();
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    programMain = initShaderProgram(gl, vsSource, fsSource);
    elev = initShaderProgram(gl, vertCode, fragCode);

    //gl.useProgram(programMain);
    gl.useProgram(elev);
    currentShader = elev


    var colorLocation = gl.getUniformLocation(currentShader, "u_color");
    var reverseLightDirectionLocation =
    gl.getUniformLocation(currentShader, "u_reverseLightDirection");

    // Set the color to use
    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

    // set the light direction.
    gl.uniform3fv(reverseLightDirectionLocation, normalize(vec3(1.0, 1.7, 0.0)));

    // Create an empty buffer object to store the vertex buffer
    // var vertex_buffer = new AttributeBuffer(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // vertex_buffer.specBuffer("coordinates", 3, gl.FLOAT, 0, 0);

    /*==========Defining and storing the geometry=======*/
    camera = new Camera("fps", canvas);


    //get uniform location for vertex shader
    u_projection_point = gl.getUniformLocation(currentShader, "u_projection");
    u_view_point = gl.getUniformLocation(currentShader, "u_view");
    u_model = gl.getUniformLocation(currentShader, "u_model");

    /*============= Drawing the primitive ===============*/
    now = 0;

     // Enable the depth test
     gl.enable(gl.DEPTH_TEST);

     // Clear the color buffer bit
     gl.clear(gl.COLOR_BUFFER_BIT);

     //init two arrays. one holds the actual object to be rendered. The other holds information about
     //the object for indexing and removing/altering object properties. Had to do it this way to access object functions
     for(let i=0; i < data['meshes'].length; i++){
        objectListDesc.push({'name': data['meshes'][i].name, 'index': i})
        objectList.push(new Cube(10.5));
        objectList[i].model = translate(vec3(data['meshes'][i].position))
        objectList[i].model = mult(objectList[i].model, rotate(0.5, 0.0, 1.0, 0.0))
        objectList[i].color = vec4(data['meshes'][i].color)
        objectList[i].genBuffers();
        objectList[i].genUniforms();
      }

      bridges_scene.unpack = function(data){

      }

      bridges_scene.render = function(data){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        dt = 0.01;
        currentFrame = Date.now();
        delta = currentFrame - then;
        if (delta > interval){
          then = currentFrame - (delta % interval);
          movementTick(camera);
        }


        // gl.enable(gl.CULL_FACE);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);

        gl.uniformMatrix4fv(u_projection_point, false, flatten(perspective(90, gl.canvas.width/gl.canvas.height, 0.01, 1000)));
        gl.uniformMatrix4fv(u_view_point, false, flatten(lookat));
        // gl.uniformMatrix4fv(u_model, false, flatten(translate(-100, 0.0, -100)))
        gl.uniformMatrix4fv(u_model, false, flatten(mat4()))

        //light.setUniforms();


        for(let i=0; i < objectList.length; i++){
          objectList[i].associateBuffers();
          objectList[i].model = mult(objectList[i].model, rotate(now, 0.0, 1.0, 0.0));
          objectList[i].setUniforms();
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);
        }
      }

      return bridges_scene;
    }

    function render(event){
      requestAnimationFrame(render);
      now += 0.01;

      currentFrame = Date.now();
      delta = currentFrame - then;


      if (delta > interval){
        then = currentFrame - (delta % interval);
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        dt = 0.01;
        movementTick(camera);

        // gl.enable(gl.CULL_FACE);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);

        gl.uniformMatrix4fv(u_projection_point, false, flatten(perspective(90, gl.canvas.width/gl.canvas.height, 0.01, 1000)));
        gl.uniformMatrix4fv(u_view_point, false, flatten(lookat));
        // gl.uniformMatrix4fv(u_model, false, flatten(translate(-100, 0.0, -100)))
        gl.uniformMatrix4fv(u_model, false, flatten(mat4()))

        //light.setUniforms();


        for(let i=0; i < objectList.length; i++){
          objectList[i].associateBuffers();
          objectList[i].model = mult(objectList[i].model, rotate(0.5, 0.0, 1.0, 0.0));
          objectList[i].setUniforms();
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);
        }
        // cube.associateBuffers();
        // cube.model = mult(cube.model, rotate(0.5, 0.0, 1.0, 0.0));
        // cube.setUniforms();
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);
      }

    }
