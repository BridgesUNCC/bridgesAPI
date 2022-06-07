
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
      this.tBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
  }

  associateBuffers(){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    var coord = gl.getAttribLocation(currentShader, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    var norms = gl.getAttribLocation(currentShader, "a_normal");
    gl.vertexAttribPointer(norms, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(norms);

    if(this.im){
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
      var texs = gl.getAttribLocation(currentShader, "a_texcoord");
      gl.vertexAttribPointer(texs, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texs);
    }
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
        Math.random(),  Math.random(),  Math.random(),  1.0
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
