/*

Game Grid visualization abstraction for Bridges

*/
d3.gamegrid = function(canvas, W, H, data, parent) {
    //defaults
    var gamegrid = {},
        w = W || 1280,
        h = H || 800,
        dims = data.dimensions,
        numCells = dims[0] * dims[1],
        fg = [],
        bg = [],
        symbols = [],
        context,
        symbolcontext,
        symbolCanvas,
        symbolImage,
        symbolImageCanvas;

    for(let i = 0; i < 900; i++) {
      fg[i] = 0;
      symbols[i] = 0;
    }

    function setupDimensions() {
      // if more rows than cols
      if(dims[0] > dims[1]) {
        cellSize = parseInt((h)/dims[0]);
      } else {
        cellSize = Math.min(parseInt((w)/dims[1]), parseInt((h)/dims[1]));
      }
      cellSize = Math.max(cellSize, 1);

      w = dims[1]*cellSize;
      h = dims[0]*cellSize;

      context = canvas.node().getContext("2d", { alpha: false });

      // a canvas to draw each particular symbol (to facilitate color compositing)
      symbolCanvas = document.createElement("canvas");
      symbolCanvas.id = "symbolCanvas";
      symbolCanvas.width = cellSize;
      symbolCanvas.height = cellSize;
      // document.body.appendChild(symbolCanvas);
      symbolContext = symbolCanvas.getContext("2d");

      // a canvas to draw the entire symbolImage png file (for debug purposes)
      symbolImageCanvas = document.createElement("canvas");
      symbolImageCanvas.id = "symbolImageCanvas";
      // document.body.appendChild(symbolImageCanvas);

      // symbolImage - contains all symbols from which to select in the game grid
      symbolImage = new Image();
      symbolImage.onload = function() {
        var ctx = symbolImageCanvas.getContext("2d");
        // use the intrinsic size of image in CSS pixels for the canvas element
        // symbolImageCanvas.width = this.naturalWidth;
        // symbolImageCanvas.height = this.naturalHeight;

        // scale symbol image canvas based on the cellsize
        symbolImageCanvas.width = 16 * cellSize;
        symbolImageCanvas.height = 16 * cellSize;

        // draw the symbol image to the canvas
        ctx.drawImage(this, 0, 0, 16 * cellSize, 16 * cellSize);
        gamegrid.draw();
      };
      symbolImage.src = '/img/symbols.png';


      parent
        .style("width", w + 'px')
        .style("height", h + 'px')
        .style("font-size", '0px')
        .style("margin", "auto")
        .style("margin-bottom", "30px");

      // set canvas attributes
      canvas.attr("width", w + 'px').attr("height", h + 'px');
    }

    gamegrid.setupNodes = function(theData) {
      // set up nodes
      // bg = expandRLE(theData.bg);
      // fg = expandRLE(theData.fg);
      // symbols = expandRLE(theData.symbols);


      bg = Uint8Array.from(atob(theData.bg), function(c) { return c.charCodeAt(0); });
      // fg = Uint8Array.from(atob(theData.fg), function(c) { return c.charCodeAt(0); });
      // symbols = Uint8Array.from(atob(theData.symbols), function(c) { return c.charCodeAt(0); });

    };

    // rgbaArray = Uint8Array.from(atob(data.nodes), function(c) { return c.charCodeAt(0); });
    // for(var i = 0; i < rgbaArray.length; i+=4) {
    //   nodes.push(rgbaArray.slice(i, i+4));
    // }

    gamegrid.draw = function() {
      // clear the main grid
      context.clearRect(0, 0, w, h);

      // clear the symbol canvas
      // symbolCanvas.width = cellSize;
      // symbolCanvas.height = cellSize;

      // loop through all cells
      for(var i = 0; i < numCells; i++) {
        // x and y coordinates of each cell in the drawn game grid
        let x = parseInt(i%dims[1])*cellSize;
        let y = parseInt(i/dims[1])*cellSize;

        // draw bg color
        context.fillStyle = BridgesVisualizer.getNamedColor(bg[i]);
        context.fillRect(x, y, cellSize, cellSize);

        /*
          draw colored symbol
        */

        // If no symbol, do nothing
        if(symbols[i] == 0) continue;

        // position of symbol in symbolImage
        let sx = parseInt(symbols[i] % 16) * cellSize;
        let sy = parseInt(symbols[i] / 16) * cellSize;

        // draw the symbol into the intermediate canvas to color it appropriately
        // symbolContext.clearRect(0, 0, cellSize, cellSize);

        // symbolContext.fillStyle = BridgesVisualizer.getNamedColor(parseInt(Math.random()*100));
        symbolContext.fillStyle = BridgesVisualizer.getNamedColor(fg[i]);
        symbolContext.fillRect(0, 0, cellSize, cellSize);
        symbolContext.globalCompositeOperation = "destination-in";
        symbolContext.drawImage(symbolImageCanvas, sx, sy, cellSize, cellSize, 0, 0, cellSize, cellSize);
        symbolContext.globalCompositeOperation = "source-over";

        // now draw the colored symbol image into the main grid
        // console.log(sx, 0, 100, 100, x, y, cellSize, cellSize);
        context.drawImage(symbolCanvas, x, y, cellSize, cellSize);
      }
      // window.requestAnimationFrame(gamegrid.draw);
    };

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

    setupDimensions();
    gamegrid.setupNodes(data);
    gamegrid.draw();

    return gamegrid;
};
