
glsl-quad
---


####Description

glsl-quad provides simple utilities (simple quad mesh, shaders, etc.) for image processing with webgl.

See `glsl-quad-demo.js` for usage.

####Dependencies

* nodejs
* browserify
* [regl](https://github.com/mikolalysenko/regl) (for demo)
* [resl](https://github.com/mikolalysenko/resl) (for demo)
* budo (for quick demo as an alternative to running browserify) 


####Demo

To run the demo, run:

```
    cd ./glsl-quad
    
    #install npm dependencies
    npm install
    
    #browser should open with the demo
    budo glsl-quad-demo.js --open


```

Results:

branch  | demo
--------|-------
master  | [glsl-quad-demo](https://realazthat.github.io/glsl-quad/master/www/glsl-quad-demo/index.html)
        | [glsl-quad-uv-demo](https://realazthat.github.io/glsl-quad/master/www/glsl-quad-uv-demo/index.html)
        | [glsl-quad-pos-demo](https://realazthat.github.io/glsl-quad/master/www/glsl-quad-pos-demo/index.html)
        | [glsl-quad-vertical-flip-tests](https://realazthat.github.io/glsl-quad/master/www/glsl-quad-vertical-flip-tests/index.html)
develop | [glsl-quad-demo](https://realazthat.github.io/glsl-quad/develop/www/glsl-quad-demo/index.html)
        | [glsl-quad-uv-demo](https://realazthat.github.io/glsl-quad/develop/www/glsl-quad-uv-demo/index.html)
        | [glsl-quad-pos-demo](https://realazthat.github.io/glsl-quad/develop/www/glsl-quad-pos-demo/index.html)
        | [glsl-quad-vertical-flip-tests](https://realazthat.github.io/glsl-quad/develop/www/glsl-quad-vertical-flip-tests/index.html)

####Docs

```
const quad = require('./glsl-quad.js');
```

##### `quad.verts`

* A list of vertices that can be used for webgl positions, that make up a quad (two triangles).

##### `quad.indices`

* A list of indices that can be used for webgl triangles, that make up a quad (two triangles).

##### `quad.uvs`

* A list of uv attributes for the vertices.

##### `quad.shader.frag`

* Returns the webgl 1.0 fragment shader to use.
* The fragment shader expects a uniform shader (sampler2D) named `u_tex`.

##### `quad.shader.vert`

* Returns the webgl 1.0 vertex shader to use.
* The vertex shader expects:
    * A uniform float named `u_clip_y`, representing whether to flip the y-axis; values of 1 or -1.
    * An attribute list of vec2 positions of the vertices named `a_position`.
    * An attribute list of vec2 uvs of the vertices named `a_uv`.


##### `quad.bitmaps.directions.uri`

* Returns a data uri for an image that can be used to test proper display directions.
* Can see the images in the `glsl-quad/assets/` directory.


####Usage

See `glsl-quad-demo.js` for a full demo using [regl](https://github.com/mikolalysenko/regl)
and [resl](https://github.com/mikolalysenko/resl).

An excerpt:

```

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
        u_clip_y: 1
      }
    });

    drawTexture({texture});


```


