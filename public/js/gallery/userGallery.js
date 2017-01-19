/* Scripts related to the Bridges user gallery */

var galleryImages = d3.selectAll('.visimg');

// on mouseover of gallery image, display gallery menu
galleryImages.on('mouseover', function(d, i) {
  d3.select(this).attr('timeout', setTimeout(function () {
       galleryMenu(i);
   }, 1000)); // must hover for a full second before the menu shows
});

// on mouseout, hide gallery menu
galleryImages.on('mouseout', function(d, i) {
  clearTimeout(d3.select(this).attr('timeout'));
  hideGallery();
});

/* move gallery elements and show relevant menu */
function galleryMenu(me) {
  d3.selectAll('.gallery_assignment_container')
        .transition('userGalleryToggle').duration(250)
    .style('height', function(d, i) {
      if(i >= me) return '340px';
    });

  d3.selectAll('.gallery_assignment_div')
    .style("opacity", function(d, i) {
      if(i != me) {
        return '0.2';
      }
      return 1;
    });

  d3.selectAll(".user-gallery-menu")
        .transition('userGalleryToggle').delay(250)
    .style("display", function(d, i) {
      if(i == me) return "block";
    })
    .style("width", "300px");
}

/* return gallery elements to normal characteristics */
function hideGallery() {
  d3.selectAll('.gallery_assignment_container')
        .transition('userGalleryToggle').duration(500)
    .style('height', '200px');

  d3.selectAll('.gallery_assignment_div')
        .transition('userGalleryToggle').duration(500)
      .style("opacity", 1);

  d3.selectAll(".user-gallery-menu")
        .transition('userGalleryToggle').duration(500)
    .style("display", "none");
}
