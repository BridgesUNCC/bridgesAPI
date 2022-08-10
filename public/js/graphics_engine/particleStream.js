class ParticleStream{
  constructor(x, y, l, count, textureImagePath){
    this.particleCount = count;
    this.particleList = [];
    this.particleStreamVerts = [];
    this.particleStreamNorms = [];
    for (let i = 0; i < count; i++){
      this.particleList.push(new Particle(x, y, 0.0, Math.random() * 2, Math.random() * 360, Math.random() * 100,
                                          [Math.random(), Math.random(), Math.random(), 1.0]));
      this.particleStreamVerts.push(x, y, 0.0);
      this.particleStreamNorms.push(0, 0, -1);
    }
    //this.im = new Texture(textureImagePath);
    //this.im.loadTexture(this.im);
  }

  genBuffers(){
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particleStreamVerts), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particleStreamNorms), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  genUniforms(){
    this.u_model = gl.getUniformLocation(currentShader, "u_model");
    this.u_color = gl.getUniformLocation(currentShader, "u_color");
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
  }

  setUniforms(model, color){
    gl.uniformMatrix4fv(this.u_model, false, model);
    gl.uniform4fv(this.u_color, color);
    if(this.im){
      this.im.bindTexture();
    }
  }

}
