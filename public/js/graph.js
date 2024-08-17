//based loosely on bostock's example and
//http://bl.ocks.org/d3noob/5141278
d3.graph = function(svg, W, H, data) {

     //defaults
    var graph = {},
        mw = 0, mh = 0,
        w = W || 1280,
        h = H || 800,
        i = 0,
        vis,
        svgGroup,
        defs,
        finalTranslate,
        finalScale,
        transform;

    var labels_shown = false;

    var zoom = d3.zoom()
        .scaleExtent([0.1,10])
        .on("zoom", zoomed);

	// zoom function
	function zoomed(evt) {
		if(svgGroup) {
			//scales labels based on distance zoomed in
			d3.selectAll(".nodeLabel").style("font-size", 
								10/evt.transform.k)
			svgGroup.attr("transform", evt.transform);
		}
  	}

    vis = svg.attr("width", w)
            .attr("height", h)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + w + " " + h)
            .classed("svg-content", true)
            .call(zoom)
            .call(zoom.transform, transform);

    graph.reset = function() {
      if (!data.coord_system_type || data.coord_system_type == "cartesian") {
        finalTranslate = BridgesVisualizer.defaultTransforms.graph.translate;
        finalScale = BridgesVisualizer.defaultTransforms.graph.scale;
        transform = d3.zoomIdentity.translate(finalTranslate[0], finalTranslate[1]).scale(finalScale);
      } else {
        finalTranslate = BridgesVisualizer.defaultTransforms[data.coord_system_type].translate;
        finalScale = BridgesVisualizer.defaultTransforms[data.coord_system_type].scale;
        transform = d3.zoomIdentity.translate(0, 0).scale(finalScale);
      }
      svg.call(zoom.transform, transform);
    };

	// initialize the graph
    graph.reset();

    // if a window is specified, then do window -> viewport transformation
    if (data.coord_system_type == "window") {
      var xExtent, yExtent, viewportX, viewportY;

      // use specified window or compute the window
      if (data.window) {
          xExtent = [data.window[0], data.window[1]];
          yExtent = [data.window[2], data.window[3]];
      } 
	  else {
        xExtent = d3.extent(data.nodes.filter(function(d) { return d.location; }), function(d,i) { return d.location[0]; });
        yExtent = d3.extent(data.nodes.filter(function(d) { return d.location; }), function(d,i) { return d.location[1]; });
      }

      // set up x and y linear scales
      viewportX = d3.scaleLinear()
              .domain(xExtent)
              .range([0, w]);
      viewportY = d3.scaleLinear()
              .domain(yExtent)
              .range([h, 0]);

      // map to viewport coords
      windowProjection = function(p) {
        return [viewportX(p[0]), viewportY(p[1])];
      };
    }

    svgGroup = vis.append("g")
					.attr('transform', transform);

    var nodes = data.nodes;
//d3 expects target and source to be integers if one is to refer to the nodes by index. If target adn soure are strings, then they are refering to IDs of the nodes and not index in the array
for (var x in data.links) {
data.links[x].target = +data.links[x].target;
data.links[x].source = +data.links[x].source;
}
    var links = data.links.filter(function(d){
		return d.target != d.source;
    })

    var selflinks = data.links.filter(function(d){
      return d.target == d.source;
    });

    var simulation = d3.forceSimulation(nodes)
      .distance((d) => 40 + d.length)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(BridgesVisualizer.visCenter()[0], 
					BridgesVisualizer.visCenter()[1]))
	  .force("link", d3.forceLink(links).id( (d) => d.index))

      .on("tick", ticked);
      .strength(function(d) {
                return -30 - (d.size*5);
             })
      .force("collision", d3.forceCollide()
	  .radius(function(d) {
            return d.size/3 || 10;
      	}))

  // Add marker defs to the svg element
  BridgesVisualizer.addMarkerDefs(vis);

  if(selflinks.length > 0) {
    var selfLinkG = svgGroup.selectAll(".selflink")
      .data(selflinks.reverse())  // reverse to draw end markers over links
      .enter().append("svg:g");
      selfLinkG
            .insert("svg:path")
            .attr("class", "selflink")
            .attr("id", function(d,i) { return "selflinkId_" + i; })
            .style("stroke-width", function (d) {
                return BridgesVisualizer.strokeWidthRange(d.thickness) || 1;
            })
            .style("stroke", function (d) {
                return BridgesVisualizer.getColor(d.color) || "black";
            })
            .style("opacity", function(d) {
                return d.opacity || 1;
            })
            .style("stroke-dasharray", function(d) {
                return d.dasharray || "";
            })
            .style("fill", "none")
            .on("mouseover", function(evt, d) {
              if(d.label) {
                BridgesVisualizer.textMouseover(d.label);
              }
            })
            .on("mouseout", BridgesVisualizer.textMouseout);

      // append link labels
      selfLinkG.append("svg:text")
          .classed("selfLinkLabel", true)
          .style("display", function() {
            return !BridgesVisualizer.tooltipEnabled ? "block" : "none";
          })
          .text(function(d,i) { return d.label || ""; });

       d3.selectAll(".selfLinkLabel").each(BridgesVisualizer.insertLinkLinebreaks);
  }

  var linkG = svgGroup.selectAll(".link")
      .data(links.reverse())  // reverse to draw end markers over links
      .enter().append("svg:g");
  linkG
      .insert("svg:path")
        .attr("class", "link")
        .attr("id", function(d,i) { return "linkId_" + i; })
        .attr("marker-end", "url(#marker_arrow)")
        .style("stroke-width", function (d) {
            return BridgesVisualizer.strokeWidthRange(d.thickness) || 1;
        })
        .style("stroke", function (d) {
            return BridgesVisualizer.getColor(d.color) || "black";
        })
        .style("opacity", function(d) {
            return d.opacity || 1;
        })
        .style("stroke-dasharray", function(d) {
            return d.dasharray || "";
        })
        .style("fill", "none")
        .on("mouseover", function(d) {
          if(d.label) {
            BridgesVisualizer.textMouseover(d.label);
          }
        })
        .on("mouseout", BridgesVisualizer.textMouseout);

  // append link labels
  linkG.append("svg:text")
      .classed("linkLabel", true)
      .style("display", function() {
        return !BridgesVisualizer.tooltipEnabled ? "block" : "none";
      })
      .text(function(d,i) { return d.label || ""; });

    d3.selectAll(".linkLabel").each(BridgesVisualizer.insertLinkLinebreaks);

    //outer node
    var node = svgGroup.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .on("mouseover", function(evt, d) {BridgesVisualizer.textMouseover(d.name); } )
        .on("mouseout", BridgesVisualizer.textMouseout)
        .on("dblclick", dblclick)
        .call(d3.drag()
         .on("start", dragstart)
         .on("drag", dragged)
         .on("end", dragended))
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style("stroke-dasharray", function(evt, d) {
            return d.fixed ? BridgesVisualizer.treeDashArray : "0,0";
        });

  //inner nodes
  	node
      .append('path')
      .attr("class", "node")
      .attr("d", d3.symbol()
          .type(function(d) { return BridgesVisualizer.shapeLookup(d.shape); })
          .size(function(d) { return BridgesVisualizer.scaleSize(d.size) || 1; })
      )
      .style("fill", function(d, i) {
          return BridgesVisualizer.getColor(d.color) || "steelblue";
      })
      .style("opacity", function(d) {
          return d.opacity || 1;
      })
      .each (function(d, i) {
        if(d.fx && d.fx === 0) {
          d.fx = null;
        }
        if(d.fy && d.fy === 0) {
          d.fy = null;
        }

        if (d.location) {
          var proj, point;

          if(data.coord_system_type == "equirectangular") {
            proj = d3.geoEquirectangular();
          } 
		  else if(data.coord_system_type == "albersusa") {
            proj = d3.geoAlbersUsa()
          }
          else if(data.coord_system_type == "window") {
            proj = windowProjection;
          } 
		  else if(data.coord_system_type == "cartesian"){
            d.fx = d.location[0];
            d.fy = -d.location[1];
            return;
          } 
		  else {
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

  //inner nodes
  node
      .append("text")
      .attr("class","nodeLabel")
      .attr("x", BridgesVisualizer.textOffsets.graph.x)
      .attr("y",  BridgesVisualizer.textOffsets.graph.y)
      .text(function(d) {
          return d.name;
      });

  d3.selectAll(".nodeLabel").each(BridgesVisualizer.insertLinebreaks);

  if(BridgesVisualizer.labels_shown === true){
    d3.selectAll(".nodeLabel").each(BridgesVisualizer.displayNodeLabels)
  }
  if(BridgesVisualizer.link_labels_shown === true){
    d3.selectAll(".linkLabel").each(BridgesVisualizer.displayLinkLabels)
  }



  // get control point for quadratic curve link
  function getControlPoint(from, to) {
    var p1 = from,
        p2 = to,
        midpoint = [(p1.x + p2.x)/2, (p1.y + p2.y)/2],
        p3 = {},
        length = 0.15;

    p3.x = midpoint[0] + ((length) * (p1.y - p2.y));
    p3.y = midpoint[1] - ((length) * (p1.x - p2.x));

    return p3;
  }

  function ticked() {
      node
        .attr("transform", function(d, i) {
          return "translate(" + d.x + "," + d.y + ")";
        });

      if(selflinks.length > 0) {
        selfLinkG.selectAll("path")
            .attr("d", function(d) {
              var node = nodes[d.source],
                  x1 = node.x,
                  y1 = node.y,
                  x2 = x1 + 0.1,
                  y2 = y1 + 0.1,
                  dr = BridgesVisualizer.selfEdge(node.size),
                  arc = 1,
                  rotation = -45;

              return "M" +
                  (x1) + "," +
                  (y1) + "A" +
                  dr + "," + dr + " " + rotation + "," + arc + ",1 " +
                  (x2) + "," +
                  (y2);
            });

       selfLinkG.selectAll("text")
         .attr("transform", function(d , i) {
           var myNode = nodes[d.source];
           return "translate(" + (myNode.x + 10) + "," + (myNode.y - 10) + ")";
         });
      }

      linkG.selectAll("path")
          .attr("d", function(d) {
              var x1 = d.source.x,
                  y1 = d.source.y,
                  x2 = d.target.x,
                  y2 = d.target.y,
                  dx = x2 - x1,
                  dy = y2 - y1,
                  dr = Math.sqrt(dx * dx + dy * dy),
                  arc = 0,
                  rotation = 0,
                  d2 = dr - (d.target.size / BridgesVisualizer.shapeEdge(d.target.size)),
                  ratio = d2/dr;

              return "M" +
                  (x1) + "," +
                  (y1) + "A" +
                  dr + "," + dr + " " + rotation + "," + arc + ",1 " +
                  (x1 + (dx * ratio)) + "," +
                  (y1 + (dy * ratio));
          });

      linkG.selectAll("text")
        .attr("transform", function(d , i) {
          var ctrl = getControlPoint(d.target, d.source);
          return "translate(" + ctrl.x + "," + ctrl.y + ")";
        });
  }


  // Handle doubleclick on node path (shape)
  function dblclick(d) {
      d3.event.stopImmediatePropagation();
      d.x = d.fx;
      d.y = d.fy;
      d.fy = null;
      d.fx = null;
      d3.select(this)
        .style("stroke-dasharray", "0,0")
        .classed("fixed", d.fixed = false);
  }

  // Handle dragstart on force.drag()
  function dragstart(evt, d) {
      d3.select(this)
        .style("stroke-width", 1)
        .style("stroke", "black")
        .style("stroke-dasharray", BridgesVisualizer.treeDashArray);

      if (!evt.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
  }

  function dragged(evt, d) {
      d.fx = evt.x;
      d.fy = evt.y;
  }

  function dragended(evt, d) {
      if (!evt.active) simulation.alphaTarget(0);
  }


  return graph;
};
