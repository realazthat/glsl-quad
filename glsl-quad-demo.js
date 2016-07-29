
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
        min: 'nearest'
      })
    }
  },
  onDone: ({texture}) => {
    const drawTexture = regl({
      frag: quad.shader.frag,
      vert: quad.shader.vert,
      attributes: {
        a_position: quad.verts,
        a_uv: quad.uvs
      },
      elements: quad.indices,
      uniforms: {
        u_tex: regl.prop('texture'),
        // Use a negative y, webgl display works upside down. I think.
        u_clip_y: -1
      }
    });

    drawTexture({texture});
  }
});
