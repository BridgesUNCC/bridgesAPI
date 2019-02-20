attribute vec4 vPosition;
attribute vec4 vColor;
uniform float zoom_factor;
uniform float transl_x;
uniform float transl_y;
varying vec4 fColor;

void main() {

  gl_PointSize = 5.0;
  gl_Position.x = vPosition.x * zoom_factor + transl_x;
  gl_Position.y = vPosition.y * zoom_factor + transl_y;
  gl_Position.z = 0.0;
  gl_Position.w = 1.0;

  // pass the vertex color to fragment shader
  fColor = vColor;
}
