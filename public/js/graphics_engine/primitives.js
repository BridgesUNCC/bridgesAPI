
class Primitives{
  constructor(type, sz, textureImage){
    this.primitiveType = type;
    sz ? this.size = sz : this.size = null;
    if(textureImage){
      this.im = new Texture(textureImage);
      //pass the texture object as a parameter
      //so the async call can access the properties of it
      this.im.loadTexture(this.im);
    }
  }

  genBuffers(){

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    if(this.im){
      this.tbuffer = new VertexBuffer(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
      this.tbuffer.specBuffer("a_texcoord", 2, gl.FLOAT, 0, 0);
    }
  }

  associateBuffers(){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    let coord = gl.getAttribLocation(currentShader, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    let norms = gl.getAttribLocation(currentShader, "a_normal");
    gl.vertexAttribPointer(norms, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(norms);

  }

  genUniforms(){
    this.u_model = gl.getUniformLocation(currentShader, "u_model");
    this.u_color = gl.getUniformLocation(currentShader, "u_color");
  }

  setUniforms(){
    gl.uniformMatrix4fv(this.u_model, false, flatten(this.model));
    gl.uniform4fv(this.u_color, this.color);
    if(this.im){
      this.im.bindTexture();
    }
  }
}

class Cube extends Primitives{
  constructor(sz, textureImagePath){
    super("Cube", sz, textureImagePath);
    this.vertices = [
      // Front face
      -sz, 0,  sz,
      sz, 0,  sz,
      -sz,  sz * 2,  sz,
      sz,  sz * 2,  sz,

      // Back face
      sz, 0, -sz,
      -sz,  0, -sz,
      sz,  sz * 2, -sz,
       -sz, sz * 2, -sz,

      // Top face
      -sz,  sz * 2, -sz,
      sz,  sz * 2,  -sz,
       -sz,  sz * 2,  sz,
       sz,  sz * 2, sz,

      // Bottom face
      -sz, 0, -sz,
       sz, 0, -sz,
       -sz, 0,  sz,
      sz, 0,  sz,

      // Right face
       sz, 0, sz,
       sz,  0, -sz,
       sz,  sz * 2,  sz,
       sz, sz * 2,  -sz,

      // Left face
      -sz, 0, -sz,
      -sz, 0,  sz,
      -sz,  sz * 2,  -sz,
      -sz,  sz * 2, sz
    ]
    this.normals = [
      //Front face
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      //Back face
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,

      //Top face
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      //Bottom face
      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
      0, -1, 0,

      //Right face
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,

      //left face
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0
    ];
    if(textureImagePath){
      this.texCoords = [
        //Front face
        0, 1,
        1, 1,
        0, 0,
        1, 0,

        //Back face
        0, 1,
        1, 1,
        0, 0,
        1, 0,

        //Top face
        0, 1,
        1, 1,
        0, 0,
        1, 0,

        //Bottom face
        0, 1,
        1, 1,
        0, 0,
        1, 0,

        //Right face
        0, 1,
        1, 1,
        0, 0,
        1, 0,

        //left face
        0, 1,
        1, 1,
        0, 0,
        1, 0
      ];
    }
    if(textureImagePath){
      this.color = [
        0.0, 0.0, 0.0, 0.0
      ];
    } else {
      this.color = [
        1.0,  0.0,  1.0,  1.0
      ];
    }
    this.model = mat4();
  }
}

class Wall extends Primitives{
  constructor(bottom_l, top_r, dir, textureImagePath){
    super("Wall", null, textureImagePath);
    this.bottom_corner = bottom_l;
    this.top_right = top_r;
    this.direction = dir;
    this.vertices = [
      this.bottom_corner[0], this.bottom_corner[1], this.bottom_corner[2],
      this.top_right[0], this.bottom_corner[1], this.top_right[2],
      this.bottom_corner[0], this.top_right[1], this.bottom_corner[2],
      this.top_right[0], this.top_right[1], this.top_right[2]
    ];
    if(textureImagePath){
      this.color = [
        0.0, 0.0, 0.0, 0.0
      ];
    } else {
      this.color = [
        1.0,  0.8,  0.3,  1.0
      ];
    }
    this.normals = [
      dir[0], dir[1], dir[2],
      dir[0], dir[1], dir[2],
      dir[0], dir[1], dir[2],
      dir[0], dir[1], dir[2]
    ];
    if(textureImagePath){
      this.texCoords = [
        0, 1,
        1, 1,
        0, 0,
        1, 0
      ];
    }
    this.model = mat4();
  }
}

class Flat extends Primitives{
  constructor(bottom_l, top_r, h, dir, textureImagePath){
    super("Flat", null, textureImagePath);
    this.bottom_corner = bottom_l;
    this.top_right = top_r;
    this.direction = dir;
    this.height = h
    this.vertices = [
      this.bottom_corner[0], h, this.bottom_corner[2],
      this.top_right[0], h, this.bottom_corner[2],
      this.bottom_corner[0], h, this.top_right[2],
      this.top_right[0], h, this.top_right[2]
    ];
    if(textureImagePath){
      this.color = [
        0.0, 0.0, 0.0, 0.0
      ];
    } else {
      this.color = [
        1.0,  1.0,  1.0,  1.0
      ];
    }
    this.normals = [
      dir[0], dir[1], dir[2],
      dir[0], dir[1], dir[2],
      dir[0], dir[1], dir[2],
      dir[0], dir[1], dir[2]
    ];
    if(textureImagePath){
      this.texCoords = [
        0, 2,
        2, 2,
        0, 0,
        2, 0
      ];
    }
    this.model = mat4();
  }
}

class CustomMesh{

  constructor(vertices, normals){
    this.vertices = vertices
    this.normals = this.genNormals()
    this.model = mat4();
    this.color = [
      1.0,  1.0,  0.5,  1.0
    ];
  }

  /*
  automatically generate the normals for each face of the custom mesh for lighting calculations
  Calculate the normal of each adjacent face (triangle) of the current vertex
    - To do this calculate the vectors of the two edges of the triangle and get
    the cross product between the two vectors.
    i.e. if the three points/vertices of your triangle are A,B,C in clockwise
      vector 1 = B-A
      vector 2 = C-A
      face normal vector N= (B-A)x(C-A)

      Divide the face normal vector N by its magnitude ||N||.
  */
  genNormals(){
    let temp_normals = []
    for(let i = 0; i <= this.vertices.length-9; i+=9){
      let A = vec3(this.vertices[i], this.vertices[i+1], this.vertices[i+2])
      let B = vec3(this.vertices[i+3], this.vertices[i+4], this.vertices[i+5])
      let C = vec3(this.vertices[i+6], this.vertices[i+7], this.vertices[i+8])
      let faceNormal = normalize(cross(subtract(B, A), subtract(C, A)))
      temp_normals.push(faceNormal[0], faceNormal[1], faceNormal[2],
                        faceNormal[0], faceNormal[1], faceNormal[2],
                        faceNormal[0], faceNormal[1], faceNormal[2],)
    }
    return temp_normals
  }

  genBuffers(){
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

  }

  associateBuffers(){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    let coord = gl.getAttribLocation(currentShader, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    let norms = gl.getAttribLocation(currentShader, "a_normal");
    gl.vertexAttribPointer(norms, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(norms);

  }

  setUniforms(){
    gl.uniformMatrix4fv(this.u_model, false, flatten(this.model));
    gl.uniform4fv(this.u_color, this.color);
  }

  genUniforms(){
    this.u_model = gl.getUniformLocation(currentShader, "u_model");
    this.u_color = gl.getUniformLocation(currentShader, "u_color");
  }
  //
  // // genUniforms(){
  // //   this.u_model = gl.getUniformLocation(currentShader, "u_model");
  // //   this.u_color = gl.getUniformLocation(currentShader, "u_color");
  // // }
  // //
  // // setUniforms(){
  // //   gl.uniformMatrix4fv(this.u_model, false, flatten(this.model));
  // //   gl.uniform4fv(this.u_color, this.color);
  // //   if(this.im){
  // //     this.im.bindTexture();
  // //   }
  // // }
}


class Sphere{

  constructor(divisions, radius){
    this.divisions = divisions;
    this.radius = radius;
  }
}
