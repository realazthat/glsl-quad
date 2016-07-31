(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.glslQuad = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

const show_uvs_fshader = `
  precision mediump float;
  varying vec2 v_uv;
  void main () {
    gl_FragColor = vec4(v_uv,0,1);
  }
`;


const show_positions_vshader = `
  precision mediump float;
  attribute vec2 a_position;

  uniform float u_clip_y;

  varying vec2 v_uv;
  
  void main() {
    gl_Position = vec4(a_position * vec2(1,u_clip_y), 0, 1);
    v_uv = gl_Position.xy;
  }
`;

const show_positions_fshader = `
  precision mediump float;
  varying vec2 v_uv;
  void main () {
    gl_FragColor = vec4(v_uv,0,1);
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
kvIARVAAAAAElFTkSuQmCC`.replace(/\s*/g, '');

const bitmaps = {
  directions: {uri: directionsDataUri}
};

module.exports = {verts, indices, uvs, shader: {vert: vshader, frag: fshader}
                  , show: {
                    uvs: {frag: show_uvs_fshader, vert: vshader},
                    positions: {frag: show_positions_fshader, vert: show_positions_vshader}
                  }
                  , bitmaps};

},{}]},{},[1])(1)
});