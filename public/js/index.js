var getContent = function(d) {
  var linebreak = " <br> ",
      content = linebreak;

  content += "<span style='max-lines:1;'>" + (d.title ? d.title : "Assignment ") + d.assignmentNumber+"</span>";
  content += linebreak;
  content += d.email + linebreak
  content += "Type: " + d.vistype + linebreak;
  // content += d.description + linebreak;


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
      .classed("assignment-image", true)
    .append('img')
      .attr('class', 'picture')
      .attr('src', function(d) {
        if(d.vistype == "nodelink")
            return '/img/graph.png';
        else if(d.vistype == "Alist")
            return '/img/array.png';
        else
            return '/img/'+d.vistype.toLowerCase()+'.png';

      });

  assignmentWindow.append("div")
    .classed("assignment-text", true)
    .html(function(d, i) { return getContent(d); });

};

var initTopGallery = function(data) {
  var assignmentWindow = d3.select("#topAssigns").selectAll(".assignment-preview")
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
      .classed("assignment-image", true)
    .append('img')
      .attr('class', 'picture')
      .attr('src', function(d) {
        if(d.vistype == "nodelink")
            return '/img/graph.png';
        else if(d.vistype == "Alist")
            return '/img/array.png';
        else
            return '/img/'+d.vistype.toLowerCase()+'.png';

      });

  assignmentWindow.append("div")
    .classed("assignment-text", true)
    .html(function(d, i) {
        return getContent(d) + "Visitors Count: " + (d.visitorsCount ? d.visitorsCount : 0);
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

// grab recent uploads from the server
var getTop = function(cb, num){
  $.ajax({
      url: "/index/topAssignments",
      type: "GET",
      success: function(data) {
          cb(data);
      }
  });
};

getRecent(initGallery);

getTop(initTopGallery);
//
// var defaultAssignmentWindowWidth;
// console.log($(".assignment-preview"));
// console.log($(".assignment-preview").length);
// $(".assignment-preview").each(function(d,i){
//     if(i == 0) defaultAssignmentWindowWidth = $(this).width();
//     if($(this).width() < defaultAssignmentWindowWidth) defaultAssignmentWindowWidth = $(this).width();
// });
//
// $(".assignment-preview").width(defaultAssignmentWindowWidth);
