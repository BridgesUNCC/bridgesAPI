var getContent = function(d) {
  var content = "",
      linebreak = " <br /> ";

  content += d.title ? d.title : "Assignment " + d.assignmentNumber;
  content += linebreak + linebreak;
  content += d.email + linebreak + linebreak;
  content += "Type: " + d.vistype + linebreak + linebreak;
  content += d.description + linebreak + linebreak;


  return content;
};

var initGallery = function(data) {
  var assignmentWindow = d3.select("#recentAssigns").selectAll(".assignment-preview")
        .data(data)
    .enter()
    .append("a")
      .attr("href", function(d) {return "/assignmentByEmail/"+ d.assignmentID + "/" + d.email; })
      .append("div")
        .classed("assignment-preview", true)
        .on('mouseover', function(d, i) {
          d3.select(this).classed("hover", true);
        })
        .on('mouseout', function(d, i) {
          d3.select(this).classed("hover", false);
        });

  assignmentWindow.append("div")
    .classed("assignment-text", true)
    .html(function(d, i) { return getContent(d); });

  assignmentWindow.append("div")
      .classed("assignment-image", true)
    .append('img')
      .attr('class', 'picture')
      .classed("visimg", true)
      .attr('src', function(d) {
        if(d.vistype == "nodelink")
            return '/img/graph.png';
        else if(d.vistype == "Alist")
            return '/img/array.png';
        else
            return '/img/'+d.vistype.toLowerCase()+'.png';

      });
};

var getMore = function(cb) {
  console.log('more?');
};

// grab recent uploads from the server
var getRecent = function(cb, num){
  $.ajax({
      url: "/index/recentUploads",
      type: "GET",
      success: function(data) {
          cb(data);
      }
  });
};

getRecent(initGallery);
