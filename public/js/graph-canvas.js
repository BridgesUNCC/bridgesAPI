d3.graph_canvas = function(canvas, W, H, data, map) {
    var context = canvas.node().getContext("2d");

     //defaults
    var graph = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0;

    canvas.attr("width", w).attr("height", h);

    var finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
    var finalScale = BridgesVisualizer.defaultTransforms.graph.scale;
    var transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

    var zoom = d3.zoom()
        .scaleExtent([0.1,10])
        .on("zoom", zoomed);

    graph.reset = function() {
        finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
        finalScale =  BridgesVisualizer.defaultTransforms.graph.scale;
        transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

        canvas.call(zoom.transform, transform);
    };

    BridgesVisualizer.tooltipEnabled = false;

    var nodes = data.nodes;
    var links = data.links;

    // set fixed locations or projections where appropriate,
    //   set up symbol function
    nodes.forEach(function(d) {

      d.symbol = d3.symbol()
          .type(BridgesVisualizer.shapeLookup(d.shape))
          .size(BridgesVisualizer.scaleSize(d.size) || 10)
          .context(context);

      if(d.location) {
        var proj, point;

        if(data.coord_system_type == "equirectangular") {
          proj = d3.geoEquirectangular();
        } else if(data.coord_system_type == "albersUsa") {
          proj = d3.geoAlbersUsa();
        } else if(data.coord_system_type == "Cartesian"){
          d.fx = d.location[0];
          d.fy = d.location[1];
          return;
        } else {
          d.fx = null;
          d.fy = null;
          return;
        }

        point = proj([d.location[1], d.location[0]]);

        // make sure the transformed location exists
        if(point) {
          d.fx = point[0];
          d.fy = point[1];
        } else {  // default location for bad transform
          d.fx = 0;
          d.fy = 0;
        }
      }
    });

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink()
                          .id(function(d) { return d.index; })
                          .distance(200))
        .force("charge", d3.forceManyBody()
                          .strength(function(d) {
                            return -30 - (d.size * 5);
                          })
                          .distanceMax(500))
        .force("collision", d3.forceCollide()
                          .radius(function(d) {
                            return d.size || 10;
                          }))
        .force("center", d3.forceCenter(BridgesVisualizer.visCenter()[0], BridgesVisualizer.visCenter()[1]));

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    canvas.call(d3.drag()
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    canvas.on("dblclick", dblclick);
    canvas.call(zoom).call(zoom.transform, transform);
    canvas.on("mousemove", mousemoved);


    function ticked() {
      context.save();
      context.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));
      context.translate(transform.x, transform.y); //<-- this always applies a transform
      context.scale(transform.k, transform.k);

      // links
      // links.forEach(drawLink);
      links.forEach(drawCurvedLink);

      // nodes
      nodes.forEach(drawNode);

      context.restore();
    }

    // draw a straight line between source and target nodes
    function drawLink(d) {
      context.beginPath();

      context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.lineWidth = BridgesVisualizer.strokeWidthRange(d.thickness);
      context.globalAlpha = d.opacity;

      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);

      context.stroke();
    }

    // get control point for quadratic curve link
    function getControlPoint(d) {
      var p1 = d.source,
          p2 = d.target,
          midpoint = [(p1.x + p2.x)/2, (p1.y + p2.y)/2],
          dist = Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2)),
          p3 = {},
          length = 50;

      p3.x = midpoint[0] + ((length / dist) * (p1.y - p2.y));
      p3.y = midpoint[1] + ((length / dist) * (p1.x - p2.x));

      return p3;
    }

    function _getQBezierValue(t, p1, p2, p3) {
        var iT = 1 - t;
        return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
    }

    // get point along quadratic curve
    function getQuadraticCurvePoint(startX, startY, cpX, cpY, endX, endY, position) {
        return {
            x:  _getQBezierValue(position, startX, cpX, endX),
            y:  _getQBezierValue(position, startY, cpY, endY)
        };
    }

    // draw a curved line between source and target nodes
    function drawCurvedLink(d) {
      context.beginPath();

      context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.lineWidth = BridgesVisualizer.strokeWidthRange(d.thickness);
      context.globalAlpha = d.opacity;

      var ctrl = getControlPoint(d);
      context.moveTo(d.source.x, d.source.y);
      context.quadraticCurveTo(ctrl.x, ctrl.y,d.target.x,d.target.y);
      context.stroke();

      drawLinkText(d, getQuadraticCurvePoint(d.source.x, d.source.y, ctrl.x, ctrl.y, d.target.x, d.target.y, 0.5));
    }

    // draw each node
    function drawNode(d) {
      context.translate(d.x, d.y);
      context.beginPath();

      // draw fixed nodes with dashed stroke
      if(d.fx) {
        context.setLineDash([2]);
      } else {
        context.setLineDash([]);
      }

      context.strokeStyle = "black";
      context.fillStyle = BridgesVisualizer.getColor(d.color);
      context.globalAlpha = d.opacity;
      d.symbol();
      context.fill();
      context.stroke();
      context.translate(-d.x, -d.y);

      drawText(d);
    }

    // draw text labels with line breaks
    function drawText(d) {
      if(BridgesVisualizer.tooltipEnabled || d.hovering) {
        lines = d.name.split("\n");
        lines.forEach(function(line, i) {
          context.fillStyle = "black";
          context.fillText(line, d.x+10, d.y+(i*10)+3);
          context.fillStyle = BridgesVisualizer.getColor(d.color);
        });
      }
    }

    // draw text labels with line breaks
    function drawLinkText(d, anchor) {
      if(BridgesVisualizer.tooltipEnabled || d.hovering) {
        context.fillStyle = "black";
        context.fillText(d.weight, anchor.x, anchor.y);
        context.fillStyle = BridgesVisualizer.getColor(d.color);
      }
    }

    function zoomed(d) {
      transform = d3.event.transform; //<-- set to current transform
      ticked(); //<-- use tick to redraw regardless of event
    }

    // handle double clicks on the canvas - unstick node
    function dblclick(e) {
      d3.event.stopImmediatePropagation();
      var i,
          x = transform.invertX(d3.mouse(this)[0]),
          y = transform.invertY(d3.mouse(this)[1]),
          dx,
          dy;

      for (i = nodes.length - 1; i >= 0; --i) {
        n = nodes[i];
        dx = x - n.x;
        dy = y - n.y;
        if (dx * dx + dy * dy < (n.size/2) * (n.size/2)) {
          n.x = n.fx;
          n.y = n.fy;
          n.fy = null;
          n.fx = null;
          ticked();
        }
      }
    }

    // find a node on click
    function dragsubject() {
      if (d3.event.defaultPrevented) return;
      var i,
          x = transform.invertX(d3.event.x),
          y = transform.invertY(d3.event.y),
          dx,
          dy;

      for (i = nodes.length - 1; i >= 0; --i) {
        n = nodes[i];
        dx = x - n.x;
        dy = y - n.y;
        if (dx * dx + dy * dy < (n.size/2) * (n.size/2)) {
          n.x = transform.applyX(n.x);
          n.y = transform.applyY(n.y);
          return n;
        }
      }
    }

    function dragstarted() {
      if (d3.event.defaultPrevented) return;
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
    }

    function dragged() {
      if (d3.event.defaultPrevented) return;
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
      ticked();
    }

    function dragended() {
      if (!d3.event.active) simulation.alphaTarget(0);
    }

    // track mousemove to trigger label hovering
    function mousemoved() {
      d3.event.preventDefault();
      d3.event.stopPropagation();

      var i,
          x = transform.invertX(d3.event.layerX),
          y = transform.invertY(d3.event.layerY),
          dx,
          dy;

      // One-size-fits-all
      // console.log(simulation.find(d3.event.layerX, d3.event.layerY, 20));

      // Reflect node sizes
      for (i = nodes.length - 1; i >= 0; --i) {
        n = nodes[i];
        dx = x - n.x;
        dy = y - n.y;

        if (dx * dx + dy * dy < (n.size/2) * (n.size/2)) {
          n.hovering = true;
          ticked();
          return;
        }
        n.hovering = false;
      }
    }

    // Redraw graph if labels are toggled
    $("body").on("keydown", function(event) {
      if(event.which == "76"){
        ticked();
      }
    });

    // Expose nodes to allow saving fixed positions
    graph.nodes = nodes;

    return graph;
};
