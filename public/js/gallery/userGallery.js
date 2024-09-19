/* Scripts related to the Bridges user gallery */

var galleryImages = d3.selectAll('.gallery_assignment_container');
var galleryTooltip = d3.select('#gallery_fixed_tooltip');

// on mouseover of an assignment, display a tooltip
galleryImages.data(d3.range(0,galleryImages.size()+1))
             .on('mouseover', function(event, datum) {
  var idx = datum;
  galleryImages
    .transition().duration(50)
    .style('opacity', function(d, j) {
      return idx == j ? 1 : 0.5;
    });
  displayDetails(assignments[idx]);
});

galleryImages.on('mouseout', function(event, datum) {
  galleryImages.transition().duration(250).style("opacity", 1);
  galleryTooltip.transition().duration(250).style("opacity", 0);
});

function displayDetails(assignment) {
  if(!assignment) return;

  var text = "";
  if(assignment.title) { text+= "<h3>" + assignment.title + "</h3><br/>"; }
  if(assignment.description) { text+= "<i>\"" + assignment.description + "\"</i><br/><br/>"; }
  text+= "<b>Assignment:</b> " + assignment.assignmentNumber + "<br/>";
  text+= "<b>Data Structure:</b> " + assignment.assignment_type  + "<br/>";
  text+= "<b>Date Created:</b> " + assignment.dateCreated  + "<br/>";

  galleryTooltip
      .transition().duration(150)
      .style("opacity", 0.9)
      .style('border-left', 'solid 2px steelblue');

  galleryTooltip.html(text);
}
