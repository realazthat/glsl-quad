
const verts = [
  [-1.0, -1.0],
  [+1.0, -1.0],
  [-1.0, +1.0],
  [-1.0, +1.0],
  [+1.0, -1.0],
  [+1.0, +1.0]
];

const uvs = [
  [0.0, 0.0],
  [1.0, 0.0],
  [0.0, 1.0],
  [0.0, 1.0],
  [1.0, 0.0],
  [1.0, 1.0]
];

const indices = [
  [0, 1, 2],
  [3, 4, 5]
];

const vshader = `
  precision mediump float;
  attribute vec2 a_position;
  attribute vec2 a_uv;

  uniform float u_clip_y;

  varying vec2 v_uv;
  
  void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position * vec2(1,u_clip_y), 0, 1);
  }
`;

const fshader = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_tex;
  void main () {
    gl_FragColor = texture2D(u_tex,v_uv);
  }
`;

const directionsDataUri = `
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAA
BACAIAAAAlC+aJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQ
UAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAEbSURBVGhD7dhRDsIgEI
RhjubNPHqlHUTAdjfRWRKa+UIirQnd376Z0vZZG1vQsfvB76WAa3
En3yug3GHD0HX6gIZCAaYaEGdSQM2g9yjApADfpIBhTzQvIIgCTA
rwKcCkAJ8CTArwKcCkAN/56Y/8XAZCwH7AsS6sEDBseisEYF1YIW
DY9Lq7eW6Mjk29/Bk/YD+vO7Bc/D/rKULAqSbj80tHrOehPC9mjY
/krhkBeBF4HvZE6CgXRJgeW3wAPYMf0IwO1NO/RL2BhgJMCvApwK
QAnwJMCvApwKQAnwJMCvApwNQGYE/vmRowbCgUYLpbQHvJMi8gSN
TpmLsGxGWsH9Aq90gwfW1gwv9zx+qUr0mWD8hCps/uE5DSC/pgVD
kvIARVAAAAAElFTkSuQmCC`.replace(' ', '').replace('\n', '').replace('\r', '');

const bitmaps = {
  directions: {uri: directionsDataUri}
};

module.exports = {verts, indices, uvs, shader: {vert: vshader, frag: fshader}, bitmaps};
