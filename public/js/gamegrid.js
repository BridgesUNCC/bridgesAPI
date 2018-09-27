/*

Game Grid visualization abstraction for Bridges

*/
d3.gamegrid = function(canvas, W, H, data, parent) {
    var context = canvas.node().getContext("2d", { alpha: false });

    //defaults
    var grid = [],
        w = W || 1280,
        h = H || 800,
        dims = data.dimensions,
        numCells = dims[0] * dims[1],
        fg = [],
        bg = [],
        symbols = [];

    // if more rows than cols
    if(dims[0] > dims[1]) {
      cellSize = parseInt((h)/dims[0]);
    } else {
      cellSize = Math.min(parseInt((w)/dims[1]), parseInt((h)/dims[1]));
    }
    cellSize = Math.max(cellSize, 1);



    w = dims[1]*cellSize;
    h = dims[0]*cellSize;

    BridgesVisualizer.setupSymbols(cellSize);

    parent
      .style("width", w + 'px')
      .style("height", h + 'px')
      .style("font-size", '0px')
      .style("margin", "auto")
      .style("margin-bottom", "30px");

    // Set actual size in memory (scaled to account for extra pixel density).
    // var scale = window.devicePixelRatio; // <--- Change to 1 on retina screens to see blurry canvas.
    // w = w * scale;
    // h = h * scale;

    // Normalize coordinate system to use css pixels.
    // context.scale(scale, scale);
    // console.log(w, h);

    // set canvas attributes
    canvas.attr("width", w + 'px').attr("height", h + 'px');

    // set up nodes
    bg = expandRLE(data.bg);
    fg = expandRLE(data.fg);
    symbols = expandRLE(data.symbols);

    // rgbaArray = Uint8Array.from(atob(data.nodes), function(c) { return c.charCodeAt(0); });
    // for(var i = 0; i < rgbaArray.length; i+=4) {
    //   nodes.push(rgbaArray.slice(i, i+4));
    // }

    function draw() {
      context.clearRect(0, 0, w, h);
      context.lineWidth = 2;

      for(var i = 0; i < numCells; i++) {
        // get coordinates for cell
        let x = parseInt(i%dims[1])*cellSize;
        let y = parseInt(i/dims[1])*cellSize;

        // draw bg
          // get color
          context.fillStyle = BridgesVisualizer.getNamedColor(bg[i]);
          // draw rect
          context.fillRect(x, y, cellSize, cellSize);

        // draw fg/symbol
          // get color
          // context.strokeStyle = BridgesVisualizer.getNamedColor(fg[i]);
          context.fillStyle = BridgesVisualizer.getNamedColor(fg[i]);

          // get symbol
          symbol = BridgesVisualizer.getSymbol(symbols[i]);
          // draw symbol in correct location
          context.translate(x, y);
          // // context.translate(0.5, 0.5);
          context.fill(symbol);
          // // context.translate(-0.5, -0.5);
          context.translate(-x, -y);
      }
      window.requestAnimationFrame(draw);
    }

    // draw a node of the grid
    function drawNode(d, i) {
      context.fillStyle = "rgba(" + d[0] + "," + d[1] + "," + d[2] + "," + (d[3]/255) + ")";
      context.fillRect(parseInt(i%dims[1])*cellSize, parseInt(i/dims[1])*cellSize, cellSize, cellSize);
    }
    //
    // function _base64ToArrayBuffer(base64) {
    //     var binary_string =  window.atob(base64);
    //     var len = binary_string.length;
    //     var bytes = new Uint8Array( len );
    //     for (var i = 0; i < len; i++)        {
    //         bytes[i] = binary_string.charCodeAt(i);
    //     }
    //     return bytes.buffer;
    // }
    //
    draw();


    function expandRLE(arr) {
      out = [];
      for(let pair of arr.split(",")) {
        pair = pair.split("x");
        val = parseInt(pair[0]);
        num = parseInt(pair[1]);
        for(let i = 0; i < num; i++) {
          out.push(val);
        }
      }
      return out;
    }
};
