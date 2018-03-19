//based loosely on bostock's example and
//http://bl.ocks.org/d3noob/5141278
d3.graph = function(canvas, W, H, data) {
    var context = canvas.node().getContext("2d");


     //defaults
    var graph = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0;

    canvas.attr("width", w).attr("height", h);

    var transform = d3.zoomIdentity; //<-- identity transform
    var vis, svgGroup, defs;
    var count = 0;
    var finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
    var finalScale = BridgesVisualizer.defaultTransforms.graph.scale;

    var nodes = data.nodes;
    var links = data.links;

    // set fixed locations or projections where appropriate
    nodes.forEach(function(d) {
      if(d.location) {
        var proj, point;

        if(data.coord_system_type == "equirectangular") {
          proj = d3.geoEquirectangular();
        } else if(data.coord_system_type == "albersUsa") {
          proj = d3.geoAlbersUsa();
        } else {  // cartesian space
          d.fx = d.location[0];
          d.fy = d.location[1];
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
                          .distance(100)
                          .strength(0.5))
        .force("charge", d3.forceManyBody()
                            .strength(-30))
        .force("center", d3.forceCenter(width / 2, height / 2));


    var defaultColors = d3.scale.category20(); //10 or 20

    // http://stackoverflow.com/questions/27802669/how-do-i-change-the-colour-of-markers-arrow-heads-solved
    // canvas.append("svg:defs").selectAll("marker")
    //     .data(["end"])// Different path types defined here
    //     .enter().append("svg:marker")
    //     .attr("id", String)
    //     .attr("viewBox", "0 0 15 15")
    //     .attr("refX", 15) // increase this to move the pointer back along the line
    //     .attr("refY", 5)
    //     .attr("markerUnits", "userSpaceOnUse")
    //     .style("fill", function (d) {
    //         return BridgesVisualizer.getColor(d.color) || "black";
    //     })
    //     .style("opacity", function(d) {
    //         return d.opacity || 1;
    //     })
    //     .attr("markerWidth", 10)
    //     .attr("markerHeight", 10)
    //     .attr("orient", "auto")
    //     .append("svg:path")
    //     .attr("d", "M 0 0 L 10 5 L 0 10 z");


    // node data binding
    // var nodeBinding = canvas.selectAll("custom.node")
    //     .data(nodes);

    // bind node attributes
    // nodeBinding
    //     .enter().append("custom")
        // .on("mouseover", BridgesVisualizer.textMouseover)
        // .on("mouseout", BridgesVisualizer.textMouseout)
        // .on("dblclick", dblclick)

        // .style("stroke", "black")
        // .style("stroke-width", "1")
        // .style("stroke-dasharray", function(d) {
        //     return d.fixed ? BridgesVisualizer.treeDashArray : "0,0";
        // })
        // .call(force.drag);

    // bind node attributes
    // nodeBinding.enter()
    //     .append("custom")
    //     .classed("node", true)
    //     // .attr("d", d3.svg.symbol()
    //     //     .type(function(d) { return d.shape || "circle"; })
    //     //     .size(function(d) {return BridgesVisualizer.scaleSize(d.size || 1); })
    //     // )
    //     .attr("fillstyle", function(d, i) {
    //         return BridgesVisualizer.getColor(d.color) || defaultColors(i);
    //     })
    //     .attr("opacity", function(d) {
    //         return d.opacity || 1;
    //     })
    //     .attr("x", function(d, i) {
    //       return i * 50;
    //     })
    //     .attr("y", function(d, i) {
    //       return i * 50;
    //     })
    //     .attr("size", 100);
        // .each(function(d, i) {
        //   if(d.location) {
        //     d.fixed = true;
        //
        //     // apply relevant transformations to location attributes
        //     if(d3.geo[data.coord_system_type]) { // d3 projection
        //       var proj = d3.geo[data.coord_system_type]();
        //       var point = proj([d.location[1], d.location[0]]);
        //
        //       // make sure the transformed location exists
        //       if(point) {
        //         d.x = point[0];
        //         d.y = point[1];
        //       } else {  // default location for bad transform
        //         d.x = 0;
        //         d.y = 0;
        //       }
        //     } else {  // cartesian space
        //       d.x = d.location[0];
        //       d.y = -1 * d.location[1];
        //     }
        //   }
        // });

    //inner nodes
    // node
    //   .append("text")
    //   .attr("class","nodeLabel")
    //   .attr("x", BridgesVisualizer.textOffsets.graph.x + 2)
    //   .attr("y",  BridgesVisualizer.textOffsets.graph.y + 14)
    //   .style("color",'black')
    //   .style("pointer-events", "none")
    //   .style("opacity", 0.0)
    //   .text(function(d) {
    //       return d.name;
    //   });

    // var link = canvas.append("svg:g").selectAll("path")
    //   .data(links.reverse())  // reverse to draw end markers over links
    //   .enter().insert("svg:path")
    //   .attr("class", "link")
    //   .attr("marker-end", "url(#end)")
    //   // .attr("marker-end", function(d) {  // modify this for programmatic arrow points
    //   //   return BridgesVisualizer.marker(vis, (BridgesVisualizer.getColor(d.color) || "black"), {});
    //   // })
    //   .style("stroke-width", function (d) {
    //       return BridgesVisualizer.strokeWidthRange(d.thickness) || 1;
    //   })
    //   .style("stroke", function (d) {
    //       return BridgesVisualizer.getColor(d.color) || "black";
    //   })
    //   .style("opacity", function(d) {
    //       return d.opacity || 1;
    //   })
    //   .style("stroke-dasharray", function(d) {
    //       return d.dasharray || "";
    //   })
    //   .style("fill", "none")
    //   .style("pointer-events", "none");
    //
    //
    //

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    canvas.call(d3.drag()
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    canvas.call(d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed));
    canvas.on("mousemove", mousemoved);

    function ticked() {
      context.save();
      context.clearRect(0, 0, canvas.attr("width"), canvas.attr("height"));
      context.translate(transform.x, transform.y); //<-- this always applies a transform
      context.scale(transform.k, transform.k);

      // links
      links.forEach(drawLink);
      // links.forEach(drawCurvedLink);

      // nodes
      nodes.forEach(drawNode);

      context.restore();
    }

    function drawLink(d) {
      context.beginPath();

      context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.lineWidth = BridgesVisualizer.strokeWidthRange(d.thickness);
      context.globalAlpha = d.opacity;

      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);

      context.stroke();
    }

    function drawCurvedLink(d) {
      curveRadius = 5;
      angleRadians = 0.3;

      context.beginPath();

      context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.lineWidth = BridgesVisualizer.strokeWidthRange(d.thickness);
      context.globalAlpha = d.opacity;

      midX = d.source.x + ((d.target.x - d.source.x) / 2);
      midY = d.source.y + ((d.target.y - d.source.y) / 2);
      xDiff = midX - d.source.x;
      yDiff = midY - d.source.y;
      angle = (Math.atan2(yDiff, xDiff) * (180 / Math.PI)) - 90;
      angleRadians = Math.toRadians(angle);
      pointX = (midX + curveRadius * Math.cos(angleRadians));
      pointY = (midY + curveRadius * Math.sin(angleRadians));

      path.moveTo(d.source.x, d.source.y);
      path.cubicTo(d.source.x, d.source.y,pointX, pointY, d.target.x, d.target.y);
      // canvas.drawPath(path, paint);

      // return this;
    }

    function drawNode(d) {
      context.beginPath();

      // context.strokeStyle = BridgesVisualizer.getColor(d.color);
      context.strokeStyle = "black";
      context.fillStyle = BridgesVisualizer.getColor(d.color);
      context.globalAlpha = d.opacity;

      // context.arc(x,y,r,sAngle,eAngle,counterclockwise);
      context.arc(d.x, d.y, d.size/2, 0, 2 * Math.PI);

      context.fill();
      context.stroke();
    }

    function zoomed(d) {
      transform = d3.event.transform; //<-- set to current transform
      ticked(); //<-- use tick to redraw regardless of event
    }

    function dragsubject() {
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
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
    }

    function dragged() {
      d3.event.subject.fx = transform.invertX(d3.event.x);
      d3.event.subject.fy = transform.invertY(d3.event.y);
      ticked();
    }

    function dragended() {
      if (!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }

    function mousemoved() {
      return;
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
          BridgesVisualizer.showTooltip(n.name, d3.event.layerX, d3.event.layerY);
          return;
        }
      }

      BridgesVisualizer.showTooltip();
    }

  // canvas.selectAll('text').each(BridgesVisualizer.insertLinebreaks);
};
