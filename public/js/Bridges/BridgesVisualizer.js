(function() {
  BridgesVisualizer.strokeWidthRange = d3.scale.linear().domain([1,50]).range([1,15]).clamp(true);
  //scale values between 1 and 100 to a reasonable range
  BridgesVisualizer.scaleSize = d3.scale.linear().domain([1,50]).range([80,4000]);

  // Offsets for text labels for visualization types
  BridgesVisualizer.textOffsets = {
    "graph": { "x": 22, "y": -10 },
    "tree": { "x": 200, "y": -15 },
    "default": { "x": 0, "y": 0}
  };

  BridgesVisualizer.treeDashArray = "3px, 3px";

  // Keep track of the center of the default vis window
  BridgesVisualizer.visCenter = function() {
    return [document.getElementById("vis0").clientWidth/2 || 0,
            document.getElementById("vis0").clientHeight/2 || 0];
  };

  // Default scale and transform values for each data structure
  BridgesVisualizer.defaultTransforms = {
    "Alist": { "scale": 0.4, "translate": [20, 100]},
    "array": { "scale": 0.4, "translate": [20, 100]},
    "Array2D": { "scale": 0.4, "translate": [20, 100]},
    "Array3D": { "scale": 0.4, "translate": [20, 100]},

    //added this new objects, see 278, method reset()
    //this changes were made to handle mixed assignments when calling the reset method.
    "list": { "scale": 0.3, "translate": [50, -5]},
    "llist": { "scale": 0.3, "translate": [50, -5]},
    "dllist": { "scale": 0.3, "translate": [50, -5]},
    "cdllist": { "scale": 0.3, "translate": [50, -5]},
    "cllist": { "scale": 0.3, "translate": [50, -5]},

    "graph": { "scale": 0.5, "translate": BridgesVisualizer.visCenter()},
    "nodelink": { "scale": 0.5, "translate": BridgesVisualizer.visCenter()},

    "tree": { "scale": 0.9, "translate": [document.getElementById("vis0").clientWidth/2, 50]}
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

  //TODO, need unique ID for local storage
  BridgesVisualizer.getTransformObjectFromLocalStorage = function(visID) {

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

  BridgesVisualizer.textMouseover = function(d) {
      function addLineBreaks(str) {
        str = str.split("\n");
        str = str.join("<br>");
        return str;
      }

      if(!BridgesVisualizer.tooltipEnabled) return;

      //the design can be changed later, if not appropriate. Mainly for implementation
      if(d3.select(this).select("rect"))
          d3.select(this).select("rect").style("stroke", "yellow").style("stroke-width", 4);

      if(d3.select(this).select("path")){
              d3.select(this).select("path").transition()
                  .duration(750)
                  .attr('d', function (d) {
                      return d3.svg.symbol().type(d.shape||"circle")
                              .size(BridgesVisualizer.scaleSize(40))();
                  });
      }
      tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
      tooltip.html(addLineBreaks(d.name))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
      };

  BridgesVisualizer.textMouseout = function(d) {
      if(d3.select(this).select("rect"))
          d3.select(this).select("rect").style("stroke", "gray").style("stroke-width", 2);

      if(d3.select(this).select("path")){
              d3.select(this).select("path").transition()
                  .duration(750)
                  .attr('d', function (d) {
                      return d3.svg.symbol().type(d.shape||"circle")
                              .size(BridgesVisualizer.scaleSize(d.size||1))();
                  });
      }

      tooltip.transition()
          .duration(500)
          .style("opacity", 0);
  };
})();
