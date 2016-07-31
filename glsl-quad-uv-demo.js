
const resl = require('resl');
const regl = require('regl')();
const quad = require('./glsl-quad.js');

resl({
  manifest: {
    texture: {
      type: 'image',
      // quad provides a bitmap as a uri to display; the "directions" bitmap shows two
      // axis with up/down/right/left lines/arrows.
      src: quad.bitmaps.directions.uri,
      parser: (data) => regl.texture({
        data: data,
        mag: 'nearest',
        min: 'nearest',
        flipY: true
      })
    }
  },
  onDone: ({texture}) => {
    const drawTexture = regl({
      vert: quad.show.uvs.vert,
      frag: quad.show.uvs.frag,
      attributes: {
        a_position: quad.verts,
        a_uv: quad.uvs
      },
      elements: quad.indices,
      frontFace: 'ccw',
      cull: {
        enable: true,
        face: 'back'
      },
      uniforms: {
        u_tex: regl.prop('texture'),
        // Use a negative y, webgl display works upside down. I think.
        u_clip_y: 1
      }
    });

    drawTexture({texture});
  }
});
