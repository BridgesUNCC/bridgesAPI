// Toggle the primary assignment menu
(function() {
  d3.select("#assignment-menu")
    .on('mouseover', function() {
      // display collapse arrow
      d3.select("#collapseExpand").style("display", "block");
      if(d3.select(this).classed('toggle-menu')) {
        d3.select(this).transition('brighten').duration(250).style('background-color', 'lightsteelblue');
      }
    })
    .on('mouseout', function() {
      // hide collapse arrow
      d3.select("#collapseExpand").style("display", "none");
      if(d3.select(this).classed('toggle-menu'))
        d3.select(this).transition('brighten').duration(250).style('background-color', 'steelblue');
    })
    .on("click", function() {
      if(d3.event.target !== d3.event.currentTarget) return;
      if(d3.select(this).classed('toggle-menu')) { // untoggle assignment menu
        d3.select(this).transition('toggle').duration(500).style('right', '0px').style("background-color", "#f8f8f8");
        d3.select(this).classed('toggle-menu', false);
        d3.select(this).append("div").classed('clickme', true);
        d3.select("#collapseExpand").html("&rarr;");
      } else { // toggle assignment menu
        d3.select(this).transition('toggle').duration(500).style('right', '-280px').style("background-color", "steelblue");
        d3.select(this).classed('toggle-menu', true);
        d3.select("#collapseExpand").html("&larr;");
      }
    });
})();
