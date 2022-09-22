export var FS_flatShading = `
precision highp float;
varying vec3 v_normal;

uniform vec3 u_reverseLightDirection;
uniform vec4 u_color;
void main(void) {
  vec3 normal = normalize(v_normal);

  float light = clamp(dot(normal, u_reverseLightDirection), 0.1, 1.0);
  gl_FragColor = u_color;

  // Lets multiply just the color portion (not the alpha)
  // by the light
  gl_FragColor.rgb *= light;
}
`
