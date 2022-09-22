export var VS_flatShading = `
attribute vec3 coordinates;
attribute vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

varying vec3 v_normal;

void main(void) {
  gl_PointSize = 10.0;
  vec4 position = vec4(u_projection * u_view * u_model *  vec4(coordinates, 1.0));
  v_normal = a_normal;
  gl_Position = position;
   //gl_PointSize = 10.0;
}
`
