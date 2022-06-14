
class AttributeBuffer{

  /*
  type: GLenum of buffer type. Ex: gl.ARRAY_BUFFER
  data: vertex/normal/color data in Float32Array
  usage: GLenum of buffer usage. Ex: gl.STATIC_DRAW
  */
  constructor(type, data, usage){
    this.buffer = gl.createBuffer()
    this.data = data;
    this.usage = usage;
    this.type = type;
    this.setBuffer();
  }

  bind(){
    gl.bindBuffer(this.type, this.buffer);
  }

  unbind(){
    gl.bindBuffer(this.type, null);
  }

  setBuffer(){
    this.bind()
    gl.bufferData(this.type, this.data, this.usage);
    this.unbind();
  }

  specBuffer(name, numOfComponents, typeOfValue, offset, ){
    this.bufferValueType = typeOfValue;
    this.numOfComponents = numOfComponents;
    this.offset = offset;
    this.stride = this.getStride();
    this.bind()
    let bufferLoc = gl.getAttribLocation(currentShader, name);
    gl.vertexAttribPointer(bufferLoc, numOfComponents, typeOfValue, false, this.stride, this.offset);
    gl.enableVertexAttribArray(bufferLoc);
    this.unbind();
  }

  getStride(){
    let sizeOfType
    switch (this.typeOfValue) {
      case "FLOAT":
          sizeOfType = 4;
        break;
      case "INT":
          sizeOfType = 4;
        break;
      case "UNSIGNED_BYTE":
          sizeOfType = 1;
          break;
      default:
        sizeOfType = 0;
        throw ("Inccorect type of attributeBuffer - failed at setStrideAuto!");
    }

    return sizeOfType * this.numOfComponents;
  }

  setData(data){this.data = data;}
  setType(type){this.type = type;}
  setUsage(usage){this.usage = usage;}

  getData(){return this.data;}
  getType(){return this.type;}
  getUsage(){return this.usage;}

}
