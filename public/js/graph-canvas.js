d3.graph_canvas = function(canvas, W, H, data) {
    var context = canvas.node().getContext("2d");

    //defaults
    var graph = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0,
        edgeLength = d3.scaleLinear().domain([1,1000]).range([100,250]),
        fixedNodeCount = 0;

    canvas.attr("width", w).attr("height", h);
    context.canvas.width = w;
    context.canvas.height = h;

    if(data.coord_system_type) {
      finalTranslate = BridgesVisualizer.defaultTransforms[data.coord_system_type].translate;
      finalScale =  BridgesVisualizer.defaultTransforms[data.coord_system_type].scale;
    } else {
      finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
      finalScale =  BridgesVisualizer.defaultTransforms.graph.scale;
    }
    var transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);
    var windowProjection;

    var zoom = d3.zoom()
        .scaleExtent([0.1,10])
        .on("zoom", zoomed);

    graph.reset = function() {
      if(data.coord_system_type) {
        //finalTranslate = BridgesVisualizer.defaultTransforms[data.coord_system_type].translate;
        finalScale =  BridgesVisualizer.defaultTransforms[data.coord_system_type].scale;
      } else {
        finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
        finalScale =  BridgesVisualizer.defaultTransforms.graph.scale;
      }

        transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

        canvas.call(zoom.transform, transform);
    };

    graph.resize = function() {
      var width = d3.select(".assignmentContainer").style("width"),
          height = d3.select(".assignmentContainer").style("height");
      width = width.substr(0, width.indexOf("px"));
      height = height.substr(0, height.indexOf("px"));

      canvas.attr("width", width).attr("height", height);
      context.canvas.width = width;
      context.canvas.height = height;
      ticked();
    };

    var nodes = data.nodes;
    var links = data.links;

	// d3js expects target and source to be integers if one is to refer to the 
	// nodes by i ndex. If target adn soure are strings, then they are refering 
	// to IDs of the nodes and not index in the array

	// convert to link source and target to integers
	for (let x in data.links) {
		data.links[x].target = +data.links[x].target;
		data.links[x].source = +data.links[x].source;
	}

    //   pre-split link labels with newlines
    links.forEach(function(d) {
      if(d.label && d.label.length > 0)
        d.lines = d.label.split("\n");
    });

    // if we want to do a window -> viewport transformation, set up the scales
    if(data.coord_system_type == "window") {
      var xExtent, yExtent, viewportX, viewportY;

      // use specified window or compute the window
      if(data.window) {
          xExtent = [data.window[0], data.window[1]];
          yExtent = [data.window[2], data.window[3]];
      } else {
        xExtent = d3.extent(nodes.filter(function(d) { return d.location; }), function(d,i) { return d.location[0]; });
        yExtent = d3.extent(nodes.filter(function(d) { return d.location; }), function(d,i) { return d.location[1]; });
      }

      // set up x and y linear scales
      viewportX = d3.scaleLinear()
              .domain(xExtent)
              .range([0, context.canvas.width]);
      viewportY = d3.scaleLinear()
              .domain(yExtent)
              .range([context.canvas.height, 0]);

      // take a point ([x,y]) in window coords and project it into viewport coords
      windowProjection = function(p) {
        return [viewportX(p[0]), viewportY(p[1])];
      };
    }

    // set fixed locations or projections where appropriate,
    //   set up symbol function
    //   pre-split labels with newlines
    nodes.forEach(function(d) {
      d.degree = 0;
      d.lines = d.name.split("\n");

      d.symbol = d3.symbol()
          .type(BridgesVisualizer.shapeLookup(d.shape))
          .size(BridgesVisualizer.scaleSize(d.size) || 10)
          .context(context);

      if(d.location) {
        var proj, point;

        fixedNodeCount++;

        if(data.coord_system_type == "equirectangular") {
          proj = d3.geoEquirectangular();
        } else if(data.coord_system_type == "albersusa") {
          proj = d3.geoAlbersUsa();
        } else if(data.coord_system_type == "window") {
          proj = windowProjection;
        } else if(data.coord_system_type == "cartesian"){
          d.fx = d.location[0];
          d.fy = -d.location[1];
          return;
        } else {
          d.fx = null;
          d.fy = null;
          return;
        }

        point = proj([d.location[0], d.location[1]]);

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

    links.forEach(function(d) {
      nodes[d.target].degree++;
    });


    function drawOnce() {
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
    drawOnce();

    var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
                          .id(function(d) { return (d.index); })
                          .distance(function(d) {
                             return edgeLength(d.target.degree);
                           }))
        .force("charge", d3.forceManyBody()
                          .strength(function(d) {
                            return -30 - (d.size * 5);
                          })
                          .distanceMax(500))
        .force("collision", d3.forceCollide()
                          .radius(function(d) {
                            return d.size || 10;
                          }))
        .force("center", d3.forceCenter(BridgesVisualizer.visCenter()[0], BridgesVisualizer.visCenter()[1]))
        .on("tick", ticked);

    canvas.call(d3.drag()
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    canvas.on("dblclick", dblclick);
    canvas.call(zoom).call(zoom.transform, transform);
    canvas.on("mousemove", mousemoved);


    function ticked() {
      if(fixedNodeCount == nodes.length) simulation.alpha(0);
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
    function getControlPoint(from, to) {
      var p1 = from,
          p2 = to,
          midpoint = [(p1.x + p2.x)/2, (p1.y + p2.y)/2],
          p3 = {},
          length = 0.2;

      p3.x = midpoint[0] + ((length) * (p1.y - p2.y));
      p3.y = midpoint[1] - ((length) * (p1.x - p2.x));

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

    // draw a curved self link at the given node
    function drawSelfLink(d) {
      context.beginPath();

      context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.lineWidth = BridgesVisualizer.strokeWidthRange(d.thickness);
      context.globalAlpha = d.opacity;

      var ctrl1 = {x: d.source.x,
                  y: d.source.y - 8*BridgesVisualizer.selfEdge(d.source.size)};
      var ctrl2 = {x: d.source.x + 8*BridgesVisualizer.selfEdge(d.source.size),
                  y: d.source.y};

      context.moveTo(d.source.x, d.source.y);
      context.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, d.target.x,d.target.y);
      context.stroke();

      drawLinkText(d, getQuadraticCurvePoint(d.source.x, d.source.y, ctrl2.x, ctrl1.y, d.target.x, d.target.y, 0.5));
    }

    // draw a curved line between source and target nodes
    function drawCurvedLink(d) {
      if(d.source == d.target) return drawSelfLink(d);

      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dist = Math.sqrt(dx * dx + dy * dy),
          d2 = dist - (d.target.size / BridgesVisualizer.shapeEdge(d.target.size)),
          ratio = d2/dist,
          to = {x: d.source.x + (dx * ratio), y: d.source.y + (dy * ratio)};

      context.beginPath();

      context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.fillStyle = BridgesVisualizer.getColor(d.color);
      context.lineWidth = BridgesVisualizer.strokeWidthRange(d.thickness);
      context.globalAlpha = d.opacity;

      var ctrl = getControlPoint(d.source, to);
      context.moveTo(d.source.x, d.source.y);
      context.quadraticCurveTo(ctrl.x, ctrl.y,to.x,to.y);
      context.stroke();

      drawLinkText(d, getQuadraticCurvePoint(d.source.x, d.source.y, ctrl.x, ctrl.y, d.target.x, d.target.y, 0.5));

      drawArrowhead(ctrl, to, Math.max(context.lineWidth, 3));
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
      context.lineWidth = 1;
      context.strokeStyle = "black";
      context.fillStyle = BridgesVisualizer.getColor(d.color);
      context.globalAlpha = d.opacity;
      d.symbol();
      context.fill();
      context.stroke();
      context.translate(-d.x, -d.y);

      context.font = '12px Helvetica Neue';
      drawText(d);
    }

    // draw text labels with line breaks
    function drawText(d) {
      if(BridgesVisualizer.showingNodeLabels || d.hovering) {
        context.fillStyle = "black";
        d.lines.forEach(function(line, i) {
          context.fillText(line, d.x+10, d.y+(i*10)+3);
        });
      }
    }

    // draw text labels with line breaks
    function drawLinkText(d, anchor) {
      if((BridgesVisualizer.showingLinkLabels || d.hovering) && d.lines && d.lines.length > 0 ) {
        d.lines.forEach(function(line, i) {
          context.fillStyle = "black";
          context.fillText(line, anchor.x, anchor.y+(i*10));
          context.fillStyle = BridgesVisualizer.getColor(d.color);
        });
      }
    }

    function drawArrowhead(from, to, radius) {
    	var x_center = to.x;
    	var y_center = to.y;

    	var angle;
    	var x;
    	var y;

    	context.beginPath();

    	angle = Math.atan2(to.y - from.y, to.x - from.x);
    	x = radius * Math.cos(angle) + x_center;
    	y = radius * Math.sin(angle) + y_center;

    	context.moveTo(x, y);

    	angle += (1.0/3.0) * (2 * Math.PI);
    	x = radius * Math.cos(angle) + x_center;
    	y = radius * Math.sin(angle) + y_center;

    	context.lineTo(x, y);

    	angle += (1.0/3.0) * (2 * Math.PI);
    	x = radius *Math.cos(angle) + x_center;
    	y = radius *Math.sin(angle) + y_center;

    	context.lineTo(x, y);

    	context.closePath();

    	context.fill();
    }

    function zoomed(evt) {
      transform = evt.transform; //<-- set to current transform
      ticked(); //<-- use tick to redraw regardless of event
    }

    // handle double clicks on the canvas - unstick node
    function dblclick(evt) {
      evt.stopImmediatePropagation();
      var i,
//          x = transform.invertX(d3.mouse(this)[0]),
 //         y = transform.invertY(d3.mouse(this)[1]),
			x = transform.invertX(evt.x),
			y = transform.invertX(evt.y),
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
          fixedNodeCount--;
          ticked();
        }
      }
    }

    // find a node on click
    function dragsubject(evt) {
      if (evt.defaultPrevented) return;
      var i,
          x = transform.invertX(evt.x),
          y = transform.invertY(evt.y),
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


    function dragstarted(evt) {
      if (evt.defaultPrevented) return;
      if (!evt.active) simulation.alphaTarget(0.3).restart();
      evt.subject.fx = transform.invertX(evt.x);
      evt.subject.fy = transform.invertY(evt.y);
      fixedNodeCount--;
    }

    function dragged(evt) {
      if (evt.defaultPrevented) return;
      evt.subject.fx = transform.invertX(evt.x);
      evt.subject.fy = transform.invertY(evt.y);
      ticked();
    }

    function dragended(evt) {
      if (!evt.active) simulation.alphaTarget(0);
      fixedNodeCount++;
    }

    // track mousemove to trigger label hovering
    function mousemoved(evt) {
      evt.preventDefault();
      evt.stopPropagation();

      var i,
          x = transform.invertX(evt.layerX),
          y = transform.invertY(evt.layerY),
          dx,
          dy;

      // One-size-fits-all
      // console.log(simulation.find(event.layerX, event.layerY, 20));

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
      if((event.which == "76") || event.which == "114")){
        ticked();
      }
    });

    // Expose nodes to allow saving fixed positions
    graph.nodes = nodes;

    // Expose tick method to allow redrawing in Bridges Visualizer
    graph.draw = ticked;

    // attach a map overlay to the zoom handler
    canvas.registerMapOverlay = function(map) {
      zoom.on("zoom.map", map.zoom);
    };

    return graph;
};
