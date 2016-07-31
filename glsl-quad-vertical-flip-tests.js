
const quad = require('./glsl-quad.js');
const $ = require('jquery-browserify');

const resl = require('resl');
const regl = require('regl')({
  attributes: {preserveDrawingBuffer: true}
});

function readCorners ({fbo, regl}) {
  let bindFbo = regl({framebuffer: fbo});

  let width = fbo ? fbo.color[0].width : regl.drawingBufferWidth;
  let height = fbo ? fbo.color[0].height : regl.drawingBufferHeight;

  let corners = [];
  bindFbo(function () {
    let data = regl.read();

    let ulIndex = 4 * (0);
    let urIndex = 4 * (width * 0 + width - 1);
    let llIndex = 4 * (width * (height - 1) + 0);
    let lrIndex = 4 * (width * (height - 1) + width - 1);

    corners.push(data.slice(ulIndex, ulIndex + 4));
    corners.push(data.slice(urIndex, urIndex + 4));
    corners.push(data.slice(llIndex, llIndex + 4));
    corners.push(data.slice(lrIndex, lrIndex + 4));
    // console.log('data:',data);
    // console.log('width:',width);
    // console.log('height:',height);
    // console.log('ul_index:',ul_index);
    // console.log('ur_index:',ur_index);
    // console.log('ll_index:',ll_index);
    // console.log('lr_index:',lr_index);
    // console.log('corners[0]:',corners[0]);
    // console.log('corners[1]:',corners[1]);
    // console.log('corners:',corners);
    // console.log('data:',data);
  });
  return corners;
}

function test ({fromSrc, fromSrcToFBOClipY, fbos, pingpongs, FBOToNextFBOClipY, toDst, clipYToDst, regl}) {
  const draw = regl({
    vert: quad.shader.vert,
    frag: quad.shader.frag,
    attributes: {
      a_uv: quad.uvs,
      a_position: quad.verts
    },
    elements: quad.indices,
    uniforms: {
      u_tex: regl.prop('tex'),
      u_clip_y: regl.prop('clip_y')
    },
    framebuffer: regl.prop('fbo')
  });

  let result = [];

  if (pingpongs > 0) {
    let currentIndex = 0;
    draw({tex: fromSrc, fbo: fbos[currentIndex], clip_y: fromSrcToFBOClipY});

    // read the corners from the fbo
    let corners = readCorners({fbo: fbos[currentIndex], regl});
    result.push({corners: corners, description: 'drew to the first FBO', t: Date.now()});

    // now ping pong
    for (let pingpong = 1; pingpong < pingpongs; ++pingpong) {
      let currentFromTexture = fbos[currentIndex].color[0];

      currentIndex = (currentIndex + 1) % fbos.length;
      draw({tex: currentFromTexture, fbo: fbos[currentIndex], clip_y: FBOToNextFBOClipY});

      // record the corners.
      let corners = readCorners({fbo: fbos[currentIndex], regl});
      result.push({corners: corners, description: `drew to the ${pingpong}-th FBO`, t: Date.now()});
    }

    // draw to the destination
    let currentFromTexture = fbos[currentIndex].color[0];
    draw({tex: currentFromTexture, fbo: toDst, clip_y: clipYToDst});

    if (toDst) {
      let corners = readCorners({fbo: toDst, regl});
      result.push({corners: corners, description: 'drew to the dst FBO', t: Date.now()});
    } else {
      let corners = readCorners({regl});
      result.push({corners: corners, description: 'drew to the dst renderbuffer', t: Date.now()});
    }
  } else {
    // no pingpongs

    draw({tex: fromSrc, fbo: toDst, clip_y: clipYToDst});
    if (toDst) {
      let corners = readCorners({fbo: toDst, regl});
      result.push({corners: corners, description: 'drew to the dst FBO', t: Date.now()});
    } else {
      let corners = readCorners({regl});
      result.push({corners: corners, description: 'drew to the dst renderbuffer', t: Date.now()});
    }
  }

  return result;
}

function makeFbos ({numFBOs, width, height}) {
  let fbos = [];
  for (let fboIndex = 0; fboIndex < numFBOs; ++fboIndex) {
    fbos.push(regl.framebuffer({
      color: regl.texture({
        width: width,
        height: height,
        stencil: false,
        format: 'rgba',
        type: 'uint8',
        depth: false,
        wrap: 'clamp'
      })
    }));
  }
  return fbos;
}

resl({
  manifest: {
    texture: {
      type: 'image',
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAWSURBVBhXY2BkZHRwcGBoaGg4cOAAABLyBITsaFXBAAAAAElFTkSuQmCC',
      parser: (data) => regl.texture({
        data: data,
        mag: 'nearest',
        min: 'nearest'
      })
    }
  },
  onDone: ({texture}) => {
    let fromSrc = regl.texture({
      width: 2,
      height: 2,
      stencil: false,
      format: 'rgba',
      type: 'uint8',
      depth: false,
      wrap: 'clamp',
      data: new Uint8Array([1, 1, 1, 1,
                            2, 2, 2, 2,
                            3, 3, 3, 3,
                            4, 4, 4, 4]),
      mag: 'nearest',
      min: 'nearest'
    });

    // let fbo_pool = makeFbos({numFBOs: 5, width: fromSrc.width, height: fromSrc.height});

    let testParams = [];
    let testResults = [];

    for (let numFBOs = 2; numFBOs < 5; ++numFBOs) {
      for (let clipYToDst of [-1, 1]) {
        for (let fromSrcToFBOClipY of [-1, 1]) {
          for (let pingpongs = 0; pingpongs < 10; ++pingpongs) {
            for (let FBOToNextFBOClipY of [-1, 1]) {
              let toDst = null;

              let fbos = makeFbos({numFBOs, width: fromSrc.width, height: fromSrc.height});
              // let fbos = fbo_pool.slice(0,numFBOs);

              let params = {fromSrc, fromSrcToFBOClipY, fbos, pingpongs, FBOToNextFBOClipY, toDst, clipYToDst, regl};
              testParams.push(params);

              regl.clear({
                color: [0, 0, 0, 1],
                depth: 1,
                stencil: 0
              });

              testResults.push(test(params));

              fbos.forEach(function (fbo) {
                fbo.destroy();
              });
            }
          }
        }
      }
    }

    let $table = $('<table>').appendTo('body');
    testResults.forEach(function (result, i) {
      let params = testParams[i];

      let $descTR = $('<tr>').appendTo($table);
      let $cornersTR = $('<tr>').appendTo($table);

      let $paramsTABLE = $('<table>').appendTo($('<td>').appendTo($descTR));
      $('<td>').appendTo($cornersTR);

      let $tr = $('<tr>').appendTo($paramsTABLE);
      $('<td>').text('fbos').appendTo($tr);
      $('<td>').text(params.fbos.length).appendTo($tr);

      $tr = $('<tr>').appendTo($paramsTABLE);
      $('<td>').text('pingpongs').appendTo($tr);
      $('<td>').text(params.pingpongs).appendTo($tr);

      $tr = $('<tr>').appendTo($paramsTABLE);
      $('<td>').text('Source to FBO clip_y').appendTo($tr);
      $('<td>').text(params.fromSrcToFBOClipY).appendTo($tr);

      $tr = $('<tr>').appendTo($paramsTABLE);
      $('<td>').text('FBO to FBO clip_y').appendTo($tr);
      $('<td>').text(params.FBOToNextFBOClipY).appendTo($tr);

      $tr = $('<tr>').appendTo($paramsTABLE);
      $('<td>').text('X to destination clip_y').appendTo($tr);
      $('<td>').text(params.clipYToDst).appendTo($tr);

      $tr = $('<tr>').appendTo($paramsTABLE);
      $('<td colspan="2">')
        .text(`${params.fbos.length},${params.pingpongs}, ${params.fromSrcToFBOClipY}, ${params.FBOToNextFBOClipY}, ${params.clipYToDst}`)
        .appendTo($tr);

      for (let transition of result) {
        let $descTD = $('<td>').appendTo($descTR);
        let $cornersTD = $('<td>').appendTo($cornersTR);

        $descTD.text(transition.description + ' @' + transition.t);

        let corners = transition.corners;

        corners = corners.map(function (color) {
          return color[0];
        }).join(',');
        $cornersTD.text(corners);
      }
    });

    $table.find('td').css('border', '1px solid black');
  }
});
