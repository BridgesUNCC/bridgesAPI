/*

Grid visualization abstraction for Bridges

*/
d3.grid = function(canvas, W, H, data, parent) {
    var context = canvas.node().getContext("2d");

    //defaults
    var grid = [],
        w = W || 1280,
        h = H || 800,
        nodes = [];

    // set up data dimensions
    var dims = data.dimensions;

    // if more rows than cols
    if(dims[0] > dims[1]) {
      nodeSize = parseInt((h)/dims[0]);
    } else {
      nodeSize = Math.min(parseInt((w)/dims[1]), parseInt((h)/dims[1]));
    }
    nodeSize = Math.max(nodeSize, 1);

    w = dims[1]*nodeSize;
    h = dims[0]*nodeSize;

    // // set canvas attrs
    canvas.attr("width", w + 'px').attr("height", h + 'px');
    parent.style("width", w + 'px').style("height", h + 'px');

    // set up nodes
    rgbaArray = Uint8Array.from(atob(data.nodes), function(c) { return c.charCodeAt(0); });
    for(var i = 0; i < rgbaArray.length; i+=4) {
      nodes.push(rgbaArray.slice(i, i+4));
    }

    // set up draw method from requestAnimationFrame
    function draw() {
      nodes.forEach(drawNode);
    }

    // draw a node of the grid
    function drawNode(d, i) {
      context.fillStyle = "rgba(" + d[0] + "," + d[1] + "," + d[2] + "," + (d[3]/255) + ")";
      context.fillRect(parseInt(i%dims[1])*nodeSize, parseInt(i/dims[1])*nodeSize, nodeSize, nodeSize);
    }

    function _base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    draw();
};
