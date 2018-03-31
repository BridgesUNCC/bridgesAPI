d3.bst = function (vis, W, H) {

    //defaults
    var bst = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0,
        tree,
        depthStep = 75, // could make this a function of root.height?
        root,
        svgGroup;

    var finalTranslate = BridgesVisualizer.defaultTransforms.tree.translate;
    var finalScale =  BridgesVisualizer.defaultTransforms.tree.scale;
    var transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

    // var transformObject = BridgesVisualizer.getTransformObjectFromCookie(visID);
    // if(transformObject){
    //     finalTranslate = transformObject.translate;
    //     finalScale = transformObject.scale;
    // }

    var zoom = d3.zoom()
        .scaleExtent([0.1,5])
        .on("zoom", zoomHandler);

    bst.reset = function() {
        finalTranslate = BridgesVisualizer.defaultTransforms.tree.translate;
        finalScale =  BridgesVisualizer.defaultTransforms.tree.scale;
        transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);

        vis.call(zoom.transform, transform);
    };

    //boilerplate stuff
    bst.make = function (data) {
        tree = d3.tree()
            .size([W, H])
            .nodeSize([50, 50]);

        vis
          .attr("width", w )
          .attr("height", h )
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 " + w + " " + h)
          .classed("svg-content", true)
          .call(zoom)
          .call(zoom.transform, transform);

        // Add marker defs to the svg element
        BridgesVisualizer.addMarkerDefs(vis);

        svgGroup = vis.append("svg:g").attr('transform', transform);

        root = d3.hierarchy(data, function(d) { return d.children; });
        root.x0 = 0;
        root.y0 = (w) / 2;

        draw(root);
    };

    function toggle (d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        draw(d);
    }

    function draw(source) {
        var duration = 600;

        // Compute the new tree layout.
        var treeData = tree(root);

        // Get nodes and links
        var nodes = treeData.descendants(),
           links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = 50 + d.depth * depthStep; });

        // Update the nodes with ids
        var node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .classed("clickthrough", function(d) {
                if(d.name == "NULL") return true;
            })
            .attr("transform", function(d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on("click", toggle)
            .on("mouseover", function(d) {BridgesVisualizer.textMouseover(d.data.name); } )
            .on("mouseout", BridgesVisualizer.textMouseout);

        // add and style symbol for node
        nodeEnter.append('path')
            .attr("class", "node")
            .attr("d", d3.symbol()
                .type(function(d) { return BridgesVisualizer.shapeLookup(d.data.shape); })
                .size(function(d) { return BridgesVisualizer.scaleSize(d.data.size) || 1; })
            )
            .style("fill", function(d) {
                return BridgesVisualizer.getColor(d.data.color) || "#fff";
            })
            .style("opacity", function(d) {
                return d.data.role ? 0 : ( d.data.opacity || 1 );
            });

       // add text label for key where appropriate
       if(nodes[0].key !== null) {
           nodeEnter.append("svg:text")
            .attr("dy", ".35em")
            .attr("x", "-8px")
            .attr("y",  "-15px")
            .text(function(d) { return d.data.key || ""; } );
       }

       // Text label
       nodeEnter.append("svg:text")
          .classed("nodeLabel", true)
          .attr("dy", ".35em")
          .attr("x", "20px")
          .attr("y",  "-7px")
          .style("display", "none")
          .text( function( d ) { if( (d && d.data.name &&d.data.name != "NULL") ) { return d.data.name; } else return ""; });

       // apply dash array if node has collapsed non-null children
       node.selectAll("path")
         .style("stroke", "#000")
         .style("stroke-width", function(d) {
           if(d._children) {
             var nullChild = 0;
             for (var c = 0; c < d._children.length; c++) {
               if(d._children[c].name == 'NULL') nullChild++;
             }
             if(nullChild == d._children.length) {
               return 0;
             }
             return 1;
            }
            return 0;
         })
         .style("stroke-dasharray", function(d) {
             if(d._children) {
               var nullChild = 0;
               for (var c = 0; c < d._children.length; c++) {
                 if(d._children[c].name == 'NULL') nullChild++;
               }
               if(nullChild == d._children.length) {
                 return "0,0";
               }
               return BridgesVisualizer.treeDashArray;
              }
              return "0,0";
         });

        // Transition nodes to their new position.
        var nodeUpdate = nodeEnter
            .merge(node)
            .transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + (source.x) + "," + source.y + ")";
            })
            .remove();

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
          .style('fill-opacity', 1e-6);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .style("stroke", function(d,i) {
                if(d.data.linkProperties) return BridgesVisualizer.getColor(d.data.linkProperties.color);
                return "#ccc";
            })
            .style("stroke-width", function(d,i) {
                if(d.linkProperties) return BridgesVisualizer.strokeWidthRange(d.linkProperties.thickness);
                return BridgesVisualizer.strokeWidthRange(1);
            })
            .style("opacity", function(d,i) {
                if(d.data.name == "NULL") return 0;
                return d.data.opacity || 1;
            })
            .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal(o, o);
            })
            .attr('marker-start', function(d,i){ return 'url(#marker_circle)'; })
            .attr('marker-end', function(d,i){ return 'url(#marker_arrow)'; });

        // Draw links
        var linkUpdate = linkEnter.merge(link)
            .transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d.parent, d); });

        // Transition exiting links to the parent's new position.
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal(o,o);
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

  // draw a path between source and destination
  function diagonal(s, d) {

    // Straight line
    // var path = `M ${s.x} ${s.y}
    //         L ${d.x} ${d.y}`;

    // Curved path
    var path = `M ${s.x} ${s.y}
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`

    return path;
  }

  // handle zoom and pan
  function zoomHandler() {
    if(svgGroup) {
      svgGroup.attr("transform", d3.event.transform);
    }
  }

  return bst;
};
