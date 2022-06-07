class Lighting {
  constructor(type){
    this.lightingType = type;
  }

  genUniforms(){
    if(this.lightingType == "directional"){
      reverseLightDirectionLocation = gl.getUniformLocation(currentShader, "u_reverseLightDirection");
    }
    else if (this.lightingType == "point") {
      lightWorldPositionLocation = gl.getUniformLocation(currentShader, "u_lightPosition");
      viewPosition = gl.getUniformLocation(currentShader, "u_viewPosition");
      shininessLocation = gl.getUniformLocation(currentShader, "u_shininess");
      specularColorLocation = gl.getUniformLocation(currentShader, "u_specularColor");
      lightColorLocation = gl.getUniformLocation(currentShader, "u_lightColor");
    }
  }

  setUniforms(){
    if(this.lightingType == "directional"){
      gl.uniform3fv(reverseLightDirectionLocation, normalize([0.5, 0.7, 1.0]));
    }
    else if (this.lightingType == "point") {
      // gl.uniform3fv(lightWorldPositionLocation, [0.5, (Math.sin(now) + 1.1) / 2.2, -0.5]); //uncomment for moving light
      gl.uniform3fv(lightWorldPositionLocation, [1.0, 0.5, 1.0]);
      gl.uniform3fv(viewPosition, eye);
      gl.uniform3fv(lightColorLocation, [1.0, 1.0, 1.0]);
      gl.uniform3fv(specularColorLocation, [1.0, 1.0, 1.0]);
      gl.uniform1f(shininessLocation, 150.0);
    }
  }

}
