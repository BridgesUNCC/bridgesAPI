

class CustomMesh(){

  constructor(vertices, normals){
    this.vertices = vertices
    (normals) ? this.normals = normals : this.normals = genNormals(this.vertices);
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
  genNormals(vertices){
    this.normals = []
    for(let i = 0, i <= vertices.length, i+3){
      let A = vec3(vertices[i])
      let B = vec3(vertices[i+1])
      let C = vec3(vertices=[i+2])

      let faceNormal = normalize(cross(B-A, C-A));
      this.normals.push(faceNormal.array, faceNormal.array, faceNormal.array)
    }
  }
}
