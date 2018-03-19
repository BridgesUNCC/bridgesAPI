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
        offset = parseInt(w/6),
        defaultColors = d3.scale.category20(); //10 or 20

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
      context.fillStyle = BridgesVisualizer.getColor(d);
      context.fillRect(offset + mw + parseInt(i%dims)*nodeSize, mh + parseInt((i/dims))*nodeSize, nodeSize, nodeSize);
    }

    //
    // function zoomed(d) {
    //   transform = d3.event.transform; //<-- set to current transform
    //   context.save();
    //   context.clearRect(0, 0, width, height);
    //   context.translate(transform.x, transform.y);
    //   context.scale(transform.k, transform.k);
    //   draw();
    //   context.restore();
    // }

    window.requestAnimationFrame(draw);
};
