/*

Grid visualization abstraction for Bridges

*/
d3.grid = function(canvas, W, H, data) {
    var context = canvas.node().getContext("2d");

    //defaults
    var grid = [],
        mw = 10, mh = 15,
        w = W || 1280,
        h = H || 800,
        offset = parseInt(w/6);

    // set canvas attrs
    canvas.attr("width", w).attr("height", h);
    // canvas.call(d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed));

    var nodes = data.nodes;
    var dims = Math.sqrt(nodes.length);
    var nodeSize = parseInt(h/dims);

    // set up draw method from requestAnimationFrame
    function draw() {
      nodes.forEach(drawNode);
    }

    // draw a node of the grid
    function drawNode(d, i) {
      context.fillStyle = BridgesVisualizer.getColor(data.colors[d]);
      context.fillRect(offset + mw + parseInt(i%dims)*nodeSize, mh + parseInt((i/dims))*nodeSize, nodeSize, nodeSize);
    }

    draw();
};
