/* Scripts related to the Bridges user gallery */

var galleryImages = d3.selectAll('.visimg');

// on mouseover of gallery image, display gallery menu
galleryImages.on('mouseover', function(d, i) {
  d3.select(this).attr('timeout', setTimeout(function () {
       galleryMenu(i);
   }, 500)); // delay gallery menu transition
});

// on mouseout, hide gallery menu
galleryImages.on('mouseout', function(d, i) {
  clearTimeout(d3.select(this).attr('timeout'));
  hideGallery(i);
});

/* move gallery elements and show relevant menu */
function galleryMenu(me) {
  d3.selectAll('.gallery_assignment_container')
        .transition('userGalleryToggle'+me).duration(250)
    .style('height', function(d, i) {
      if(i >= me) return '300px';
    });

  d3.selectAll('.gallery_assignment_div')
    .style("opacity", function(d, i) {
        return (i != me) ? '0.2' : 1;
    });
  d3.selectAll('.gallery_links')
    .style("opacity", function(d, i) {
        return (i != me) ? '0.2' : 1;
    });


  d3.selectAll(".user-gallery-menu")
        .transition('userGalleryToggle'+me).delay(250)
    .style("display", function(d, i) {
      if(i == me) return "block";
    })
    .style("width", "280px")
    .style("left");
}

/* return gallery elements to normal characteristics */
function hideGallery(me) {
  d3.selectAll('.gallery_assignment_container')
        .transition('userGalleryToggle'+me).duration(500)
    .style('height', '200px');

  d3.selectAll('.gallery_assignment_div, .gallery_links')
        .transition('userGalleryToggle'+me).duration(500)
      .style("opacity", 1);

  d3.selectAll(".user-gallery-menu")
        .transition('userGalleryToggle'+me).duration(500)
    .style("display", "none");
}
