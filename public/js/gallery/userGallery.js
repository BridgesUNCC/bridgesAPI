/* Scripts related to the Bridges user gallery */

var galleryImages = d3.selectAll('.gallery_assignment_container');

// on mouseover of an assignment, display a tooltip
galleryImages.on('mouseover', function(d, i) {
  galleryImages
    .transition().duration(50)
    .style('opacity', function(d, j) {
      return i == j ? 1 : 0.5;
    });
  displayDetails(assignments[i]);
});

galleryImages.on('mouseout', function(d, i) {
  galleryImages.transition().duration(150).style("opacity", 1);
});

function displayDetails(assignment) {
  if(!assignment) return;

  var text = "";
  if(assignment.title) { text+= "<h3>" + assignment.title + "</h3><br/>"; }
  if(assignment.description) { text+= "<i>\"" + assignment.description + "\"</i><br/><br/>"; }
  text+= "<b>Assignment:</b> " + assignment.assignmentNumber + "<br/>";
  text+= "<b>Data Structure:</b> " + assignment.data[0].visual  + "<br/>";
  text+= "<b>Date Created:</b> " + assignment.dateCreated  + "<br/>";

  d3.select('#gallery_fixed_tooltip')
      .transition().duration(150)
      .style("opacity", 1)
      .style('border-left', 'solid 2px steelblue');
  d3.select('#gallery_fixed_tooltip').html(text);
}
