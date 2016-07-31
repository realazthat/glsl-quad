


const quad = require('./glsl-quad.js');
const $ = require('jquery-browserify');

const resl = require('resl');
const regl = require('regl')({
  attributes: {preserveDrawingBuffer: true}
});



function read_corners({fbo,regl}){

  let bindFbo = regl({framebuffer: fbo});

  let width = fbo ? fbo.color[0].width : regl.drawingBufferWidth;
  let height = fbo ? fbo.color[0].height : regl.drawingBufferHeight;

  let corners = [];
  bindFbo(function(){
    let data = regl.read();


    let ul_index = 4*(0);
    let ur_index = 4*(width*0 + width - 1);
    let ll_index = 4*(width*(height-1) + 0);
    let lr_index = 4*(width*(height-1) + width-1);

    corners.push(data.slice(ul_index,ul_index+4));
    corners.push(data.slice(ur_index,ur_index+4));
    corners.push(data.slice(ll_index,ll_index+4));
    corners.push(data.slice(lr_index,lr_index+4));
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

function test({from_src, from_to_fbo_clip_y, fbos, pingpongs, fbo_to_next_fbo_clip_y, to_dst, clip_y_to_dst, regl}){

  const draw = regl({
    frag: quad.shader.frag,
    vert: quad.shader.vert,
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

  if (pingpongs > 0)
  {
    let current_index = 0;
    draw({tex: from_src, fbo: fbos[current_index], clip_y: from_to_fbo_clip_y});

    // read the corners from the fbo
    let corners = read_corners({fbo: fbos[current_index], regl});
    result.push( {corners: corners, description: `drew to the first FBO`, t: Date.now()} );
    

    // now ping pong
    for (let pingpong = 1; pingpong < pingpongs; ++pingpong)
    {
      let current_from_texture = fbos[current_index].color[0];

      current_index = (current_index + 1) % fbos.length;
      draw({tex: current_from_texture, fbo: fbos[current_index], clip_y: fbo_to_next_fbo_clip_y});

      ///record the corners.
      let corners = read_corners({fbo: fbos[current_index], regl});
      result.push( {corners: corners, description: `drew to the ${pingpong}-th FBO`, t: Date.now()} );
    }


    // draw to the destination
    let current_from_texture = fbos[current_index].color[0];
    draw({tex: current_from_texture, fbo: to_dst, clip_y: clip_y_to_dst});

    if (to_dst) {
      let corners = read_corners({fbo: to_dst, regl});
      result.push( {corners: corners, description: `drew to the dst FBO`, t: Date.now()} );
    } else {

      let corners = read_corners({regl});
      result.push( {corners: corners, description: `drew to the dst renderbuffer`, t: Date.now()});

    }
  } else {
    // no pingpongs


    draw({tex: from_src, fbo: to_dst, clip_y: clip_y_to_dst});
    if (to_dst) {
      let corners = read_corners({fbo: to_dst, regl});
      result.push( {corners: corners, description: `drew to the dst FBO`, t: Date.now()});
    } else {
      let corners = read_corners({regl});
      result.push( {corners: corners, description: `drew to the dst renderbuffer`, t: Date.now()});
    }

  }

  return result;
}



const drawToScreen = regl({
  frag: quad.shader.frag,
  vert: quad.shader.vert,
  attributes: {
    a_position: quad.verts,
    u_uv: quad.uvs
  },
  elements: quad.indices,
  uniforms: {
    u_tex: regl.prop('texture'),
    u_clip_y: regl.prop('clip_y'),
  }
});

function make_fbos({num_fbos, width, height}){
  let fbos = [];
  for (let fbo_index = 0; fbo_index < num_fbos; ++fbo_index) {
    fbos.push( regl.framebuffer({
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
  onDone: ({texture, digits_texture}) => {

    let from_src = regl.texture({
      width: 2,
      height: 2,
      stencil: false,
      format: 'rgba',
      type: 'uint8',
      depth: false,
      wrap: 'clamp',
      data: new Uint8Array([1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4]),
      mag: 'nearest',
      min: 'nearest'
    });


    // let fbo_pool = make_fbos({num_fbos: 5, width: from_src.width, height: from_src.height});

    let test_params = [];
    let test_results = [];

    for (let num_fbos = 2; num_fbos < 5; ++num_fbos) {
      for (let clip_y_to_dst of [-1,1]) {
        for (let from_to_fbo_clip_y of [-1,1]) {
          for (let pingpongs = 0; pingpongs < 10; ++pingpongs) {
            for (let fbo_to_next_fbo_clip_y of [-1,1]) {
              let to_dst = null;

              let fbos = make_fbos({num_fbos, width: from_src.width, height: from_src.height});
              // let fbos = fbo_pool.slice(0,num_fbos);

              let params = {from_src, from_to_fbo_clip_y, fbos, pingpongs, fbo_to_next_fbo_clip_y, to_dst, clip_y_to_dst, regl};
              test_params.push( params );

              regl.clear({
                color: [0, 0, 0, 1],
                depth: 1,
                stencil: 0
              })

              test_results.push( test(params) );

              fbos.forEach(function(fbo){
                fbo.destroy();
              })
            }
          }
        }
      }
    }

    let $table = $('<table>').appendTo('body');
    test_results.forEach(function(result, i){
      let params = test_params[i];

      let $desc_tr = $('<tr>').appendTo($table);
      let $corners_tr = $('<tr>').appendTo($table);

      $params_table = $('<table>').appendTo($('<td>').appendTo($desc_tr));
      $('<td>').appendTo($corners_tr);

      $tr = $('<tr>').appendTo($params_table);
      $('<td>').text('fbos').appendTo($tr);
      $('<td>').text(params.fbos.length).appendTo($tr);

      $tr = $('<tr>').appendTo($params_table);
      $('<td>').text('pingpongs').appendTo($tr);
      $('<td>').text(params.pingpongs).appendTo($tr);


      $tr = $('<tr>').appendTo($params_table);
      $('<td>').text('Source to FBO clip_y').appendTo($tr);
      $('<td>').text(params.from_to_fbo_clip_y).appendTo($tr);

      $tr = $('<tr>').appendTo($params_table);
      $('<td>').text('FBO to FBO clip_y').appendTo($tr);
      $('<td>').text(params.fbo_to_next_fbo_clip_y).appendTo($tr);

      $tr = $('<tr>').appendTo($params_table);
      $('<td>').text('X to destination clip_y').appendTo($tr);
      $('<td>').text(params.clip_y_to_dst).appendTo($tr);

      $tr = $('<tr>').appendTo($params_table);
      $('<td colspan="2">')
        .text(`${params.fbos.length},${params.pingpongs}, ${params.from_to_fbo_clip_y}, ${params.fbo_to_next_fbo_clip_y}, ${params.clip_y_to_dst}`)
        .appendTo($tr);





      for (let transition of result){
        let $desc_td = $('<td>').appendTo($desc_tr);
        let $corners_td = $('<td>').appendTo($corners_tr);

        $desc_td.text(transition.description + ' @' + transition.t);

        let corners = transition.corners;

        corners = corners.map(function(color){
                                return color[0];
                              }).join(',');
        $corners_td.text(corners);
      }

    });


    $table.find('td').css('border', '1px solid black');


  }
});
