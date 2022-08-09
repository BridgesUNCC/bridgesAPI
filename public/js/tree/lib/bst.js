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

        /*
              N O D E S
        */

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
            })
            .style("stroke", "black")
            .style("stroke-width", 1);

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
          .style("display", function() {
            return !BridgesVisualizer.tooltipEnabled ? "block" : "none";
          })
          .text( function( d ) { if( (d && d.data.name &&d.data.name != "NULL") ) { return d.data.name; } else return ""; });

        d3.selectAll(".nodeLabel").each(BridgesVisualizer.insertLinebreaks);

        // apply dash array if node has collapsed non-null children
        node.selectAll(".node")
          .style("stroke", "black")
          .style("stroke-width", function(d) {
            return (d.data.name == "NULL") ? 0 : 1;
          })
          .style("stroke-dasharray", function(d) {
            return (d._children) ? BridgesVisualizer.treeDashArray : "0,0";
          });

        nodeEnter.selectAll(".node")
          .style("stroke", "black")
          .style("stroke-width", function(d) {
            return (d.data.name == "NULL") ? 0 : 1;
          })
          .style("stroke-dasharray", function(d) {
            return (d._children) ? BridgesVisualizer.treeDashArray : "0,0";
          });

        // Transition nodes to their new position.
        var nodeUpdate = nodeEnter
            .merge(node)
            .transition("nodeEnter")
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition("nodeExit")
            .duration(duration)
            .attr("opacity", 0)
            .attr("transform", function(d) {
                return "translate(" + (source.x) + "," + source.y + ")";
            })
            .remove();

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
          .style('fill-opacity', 1e-6);

        /*
              L I N K S
        */

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("svg:path", "g")
            .attr("class", "link")
	    .style("fill", "none")
            .style("stroke", function(d,i) {
                if(d.data.linkProperties) return BridgesVisualizer.getColor(d.data.linkProperties.color);
                return "#ccc";
            })
            .style("stroke-width", function(d,i) {
                if(d.data.linkProperties) return BridgesVisualizer.strokeWidthRange(d.data.linkProperties.thickness);
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
            .attr('marker-end', function(d,i){ return 'url(#marker_arrow)'; })
            .on("mouseover", function(d) {
              if(d.data && d.data.linkProperties) {
               BridgesVisualizer.textMouseover("weight: " + d.data.linkProperties.thickness);
              }
             })
            .on("mouseout", BridgesVisualizer.textMouseout);

        // Draw links
        var linkUpdate = linkEnter.merge(link)
            .transition("linkUpdate")
            .duration(duration)
            .attr('d', function(d){ return diagonal(d.parent, d); });

        // Transition exiting links to the parent's new position.
        var linkExit = link.exit().transition("linkExit")
            .duration(duration)
            .attr("opacity", 0)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal(o,o);
            })
            .remove();

        /*
              L I N K   L A B E L S
        */

        var linkText = svgGroup.selectAll(".linkLabel")
            .data(links, function(d) { return d.id; });

        // Weight label
        var linkTextEnter = linkText.enter().append("svg:text")
          .classed("linkLabel", true)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
                return "translate(" + source.x + "," + source.y + ")";
          })
          .style("display", function() {
            return !BridgesVisualizer.tooltipEnabled ? "block" : "none";
          })
          .text( function( d ) {
           if( (d.data && d.data.linkProperties) ) {
             return d.data.linkProperties.thickness; // change to link label!
           } else return "";
          });

        var linkTextUpdate = linkTextEnter.merge(linkText)
            .transition("linkTextUpdate")
            .duration(duration)
            .attr("transform", function(d) {
                  return "translate(" +
                      (((d.parent.x + d.x)/2)+10) + "," +
                      ((d.parent.y + d.y)/2) + ")";
            });

        var linkTextExit = linkText.exit().transition("linkTextExit")
            .duration(duration)
            .style("display", "none")
            .attr("transform", function(d) {
                  return "translate(" +
                      d.parent.x + "," +
                      d.parent.y + ")";
            })
            .remove();

        if(BridgesVisualizer.labels_shown === true){
          d3.selectAll(".nodeLabel").each(BridgesVisualizer.displayNodeLabels)
        }
        if(BridgesVisualizer.link_labels_shown === true){
          d3.selectAll(".linkLabel").each(BridgesVisualizer.displayLinkLabels)
        }

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
