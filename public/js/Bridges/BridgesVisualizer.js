(function() {
  d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
  };

  d3.selection.prototype.moveToBack = function() {
      return this.each(function() {
          var firstChild = this.parentNode.firstChild;
          if (firstChild) {
              this.parentNode.insertBefore(this, firstChild);
          }
      });
  };

  BridgesVisualizer.defaultColors = d3.scaleOrdinal(d3.schemeCategory20);

  BridgesVisualizer.strokeWidthRange = d3.scaleLinear().domain([1,50]).range([1,15]).clamp(true);
  //scale values between 1 and 100 to a reasonable range
  BridgesVisualizer.scaleSize = d3.scaleLinear().domain([1,50]).range([10,500]);
  BridgesVisualizer.shapeEdge = d3.scaleLinear().domain([1,50]).range([1,3.3]);
  BridgesVisualizer.selfEdge = d3.scaleLinear().domain([1,50]).range([3,13]);

  // Define the div for the tooltip
  BridgesVisualizer.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .classed("shown", false)
      .style("pointer-events", "none")
      .style("opacity", 0);

  // Offsets for text labels for visualization types
  BridgesVisualizer.textOffsets = {
    "graph": { "x": 22, "y": -10 },
    "tree": { "x": 200, "y": -15 },
    "default": { "x": 0, "y": 0}
  };

  BridgesVisualizer.treeDashArray = "3px, 3px";

  // Keep track of the center of the default vis window
  BridgesVisualizer.visCenter = function() {
    return [document.getElementById("vis0").clientWidth/3 || 0,
            document.getElementById("vis0").clientHeight/2 || 0];
  };

  // Default scale and transform values for each data structure
  BridgesVisualizer.defaultTransforms = {
    "Alist": { "scale": 0.4, "translate": [20, 100]},
    "array": { "scale": 0.5, "translate": [50, 100]},
    "Array2D": { "scale": 0.4, "translate": [50, 50]},
    "Array3D": { "scale": 0.4, "translate": [20, 100]},
    "list": { "scale": 0.3, "translate": [50, -5]},
    "llist": { "scale": 0.3, "translate": [50, -5]},
    "dllist": { "scale": 0.3, "translate": [50, -5]},
    "cdllist": { "scale": 0.3, "translate": [50, -5]},
    "cllist": { "scale": 0.3, "translate": [50, -5]},
    "equirectangular": { "scale": 1, "translate": [BridgesVisualizer.visCenter()[0]/3, BridgesVisualizer.visCenter()[1]/4]},
    "albersUsa": { "scale": 1, "translate": [BridgesVisualizer.visCenter()[0]/3, BridgesVisualizer.visCenter()[1]/4]},
    "nodelink": { "scale": 0.5, "translate": BridgesVisualizer.visCenter()},
    "graph": { "scale": 0.5, "translate": [BridgesVisualizer.visCenter()[0]/2, BridgesVisualizer.visCenter()[1]/2] },
    // "tree": { "scale": 0.9, "translate": [document.getElementById("vis0").clientWidth/2, 50]}
    "tree": { "scale": 0.9, "translate": [BridgesVisualizer.visCenter()[0], BridgesVisualizer.visCenter()[1]/2] }
  };

  BridgesVisualizer.getDefaultTransforms = function(visType) {
    if(BridgesVisualizer.defaultTransforms[visType]) {
      return BridgesVisualizer.defaultTransforms[visType];
    } else {
      return {"scale": 0.9, "translate": [50, 100]};
    }
  };

  // function to return color depending on the style of representation
  BridgesVisualizer.getColor = function(color) {
    if(Array.isArray(color))
      return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
    return color;
  };

  //this array holds the assignments types; it's used to handle the mixed assignements
  BridgesVisualizer.assignmentTypes = [];

  //this boolean is used to deactivate the tooltip when all labels are shown (key 'L')
  BridgesVisualizer.tooltipEnabled = true;
  BridgesVisualizer.showingNodeLabels = false;
  BridgesVisualizer.showingLinkLabels = false;

  BridgesVisualizer.centerTextHorizontallyInRect = function(obj, width){
      return (width - obj.getComputedTextLength()) / 2;
  };

  //add three ellipsis(...) if the text length is greater than 5
  BridgesVisualizer.getShortText = function(text){
      if(text && text.length > 5){
        return text.substr(0,4)+"...";
      }else{
        return text;
      }
  };

  // bind linebreaks to text elements
  BridgesVisualizer.insertLinebreaks = function (d, i) {
      var el = d3.select(this);
      var words = d3.select(this).text().split('\n');
      el.text('');

      for (var j = 0; j < words.length; j++) {
          var tspan = el.append('tspan').text(words[j]);
          if (j > 0)
              tspan.attr('x', 0).attr('dy', '15');
      }
  };

  // bind linebreaks to link labels
  BridgesVisualizer.insertLinkLinebreaks = function (d, i) {
      var el = d3.select(this);
      var words = d3.select(this).text().split('\n');
      el.text('');

      for (var j = 0; j < words.length; j++) {
          var tspan = el.append('tspan').text(words[j]);

          if(j>0) {
            tspan.attr('dy', '15');
          }
      }
  };

  //TODO, need unique ID for local storage
  BridgesVisualizer.getTransformObjectFromLocalStorage = function(visID) {

  };

  BridgesVisualizer.addMarkerDefs = function(svg) {
    var markers = [
       { id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12' },
       { id: 1, name: 'square', path: 'M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z', viewbox: '-5 -5 10 10' },
       { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' },
       { id: 2, name: 'stub', path: 'M 0,0 m -1,-5 L 1,-5 L 1,5 L -1,5 Z', viewbox: '-1 -5 2 10' }
    ];

    // var defs = d3.select("#assignmentCanvas").append('svg:defs');
    var defs = svg.append('svg:defs');

    var marker = defs.selectAll('marker')
     .data(markers)
     .enter()
     .append('svg:marker')
       .attr('id', function(d){ return 'marker_' + d.name; })
       .attr("markerUnits", "userSpaceOnUse")
      //  .attr("markerUnits", "strokeWidth")
       .attr('markerHeight', 5)
       .attr('markerWidth', 5)
       .style("pointer-events", "none")
       .attr('orient', 'auto')
       .attr('refX', 0)
       .attr('refY', 0)
       .attr('viewBox', function(d){ return d.viewbox; })
       .append('svg:path')
         .attr('d', function(d){ return d.path; })
         .attr('fill', function(d,i) { return "#ccc"; });
  };


  // Add newly-styled markers to the defs for the given svg
  // BridgesVisualizer.marker = function(svg, color, otherAttr) {
  //     console.log('making marker', color);
  //     var val;
  //     svg.select("svg:defs").selectAll("marker")
  //          .data([val])
  //          .enter().append("svg:marker")
  //          .attr("id", String)
  //          .attr("viewBox", "0 -5 10 10")
  //          .attr("refX", 20)
  //          .attr("refY", 0)
  //          .attr("markerWidth", 6)
  //          .attr("markerHeight", 6)
  //          .attr("orient", "auto")
  //          .style("fill", color)
  //          .append("svg:path")
  //          .attr("d", "M0,-5L10,0L0,5");
  //     return "url(#" +val+ ")";
  // };

  // function to return the transformObject saved positions
  BridgesVisualizer.getTransformObjectFromCookie = function(visID) {
          var name = "vis"+visID+"-"+location.pathname + "=";
          // var name = cname + "=";
          var ca = document.cookie.split(';');
          // console.log(ca);
          for(var i=0; i<ca.length; i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') {
                  c = c.substring(1);
              }
              if (c.indexOf(name) === 0) {
                  // return c.substring(name.length, c.length);
                  var cookieStringValue = c.substring(name.length, c.length);
                  var cookieJSONValue;
                  try{
                      cookieJSONValue = JSON.parse(cookieStringValue);
                  }catch(err){
                      console.log(err, cookieStringValue);
                  }

                  if(cookieJSONValue){
                    if(cookieJSONValue.hasOwnProperty("translatex") &&
                       cookieJSONValue.hasOwnProperty("translatey") &&
                       cookieJSONValue.hasOwnProperty("scale")){
                         var finalTranslate = [parseFloat(cookieJSONValue.translatex), parseFloat(cookieJSONValue.translatey)];
                         var finalScale = [parseFloat(cookieJSONValue.scale)];
                         return {"translate":finalTranslate, "scale":finalScale};
                    }
                  }else{
                    return undefined;
                  }
              }
          }
          return "";
  };

  BridgesVisualizer.textMouseover = function(label) {
      function addLineBreaks(str) {
        str = str.split("\n");
        str = str.join("<br>");
        return str;
      }

      if(!BridgesVisualizer.tooltipEnabled || label === "") return;
      BridgesVisualizer.tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
      BridgesVisualizer.tooltip.html(addLineBreaks(label))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
      };

  BridgesVisualizer.textMouseout = function(d) {
      BridgesVisualizer.tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  };

  BridgesVisualizer.shapeLookup = function(shape) {
    switch(shape) {
      case 'circle':
        return d3.symbolCircle;
      case 'square':
        return d3.symbolSquare;
      case 'diamond':
        return d3.symbolDiamond;
      case 'triangle-down':
      case 'triangle-up':
        return d3.symbolTriangle;
      case 'cross':
        return d3.symbolCross;
      case '':
        return d3.symbolStar;
      case '':
        return d3.symbolWye;
      default:
        return d3.symbolCircle;
    }
  };

  BridgesVisualizer.projLookup = function(proj) {
    switch(proj) {
      case 'equirectangular':
        return d3.geoEquirectangular();
      // case 'square':
      //   return d3.symbolSquare;
      // case 'diamond':
      //   return d3.symbolDiamond;
      // case 'triangle-down':
      // case 'triangle-up':
      //   return d3.symbolTriangle;
      // case 'cross':
      //   return d3.symbolCross;
      // case '':
      //   return d3.symbolStar;
      // case '':
      //   return d3.symbolWye;
      default:
        return d3.geoEquirectangular();
    }
  };

  BridgesVisualizer.displayNodeLabels = function() {
    if(!BridgesVisualizer.showingNodeLabels) {
        d3.selectAll(".nodeLabel").style("display","block").style("opacity","1");
        BridgesVisualizer.showingNodeLabels = true;
    } else {
        d3.selectAll(".nodeLabel").style("display","none").style("opacity","0");
        BridgesVisualizer.showingNodeLabels = false;
    }
  };

  BridgesVisualizer.displayLinkLabels = function() {
    if(!BridgesVisualizer.showingLinkLabels) {
        d3.selectAll(".linkLabel").style("display", "block");
        d3.selectAll(".selfLinkLabel").style("display", "block");
        BridgesVisualizer.showingLinkLabels = true;
    } else {
        d3.selectAll(".linkLabel").style("display", "none");
        d3.selectAll(".selfLinkLabel").style("display", "none");
        BridgesVisualizer.showingLinkLabels = false;
    }
  };

  $("body").on("keydown", function(event) {
      if(event.which == "76"){
        BridgesVisualizer.displayNodeLabels();
        BridgesVisualizer.displayLinkLabels();
      }
  });

})();
