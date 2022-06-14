class Lighting {
  constructor(type){
    this.lightingType = type;
    if (type == "directional"){
      this.reverseLightDirectionLocation = gl.getUniformLocation(currentShader, "u_reverseLightDirection");
      this.lightDirection = normalize([0.5, 0.7, 1.0])
    } else {
      this.lightWorldPositionLocation = gl.getUniformLocation(currentShader, "u_lightPosition");
      this.viewPosition = gl.getUniformLocation(currentShader, "u_viewPosition");
      this.shininessLocation = gl.getUniformLocation(currentShader, "u_shininess");
      this.specularColorLocation = gl.getUniformLocation(currentShader, "u_specularColor");
      this.lightColorLocation = gl.getUniformLocation(currentShader, "u_lightColor");
      this.lightPosition = [1.0,0.5,1.0];
      this.lightColor = [1.0, 1.0, 1.0];
      this.specularColor = [1.0, 1.0, 1.0];
      this.shininessFactor = 150.0;
    }

    this.setUniforms();
  }

  setLightPosition(pos){
    this.lightPosition = pos;
    gl.uniform3fv(this.lightWorldPositionLocation, this.lightPosition);
  }

  setUniforms(){
    if(this.lightingType == "directional"){
      gl.uniform3fv(this.reverseLightDirectionLocation, this.lightDirection);
    }
    else if (this.lightingType == "point") {
      // gl.uniform3fv(lightWorldPositionLocation, [0.5, (Math.sin(now) + 1.1) / 2.2, -0.5]); //uncomment for moving light
      gl.uniform3fv(this.lightWorldPositionLocation, this.lightPosition);
      gl.uniform3fv(this.viewPosition, eye);
      gl.uniform3fv(this.lightColorLocation, this.lightColor);
      gl.uniform3fv(this.specularColorLocation, this.specularColor);
      gl.uniform1f(this.shininessLocation, this.shininessFactor);
    }
  }

}
