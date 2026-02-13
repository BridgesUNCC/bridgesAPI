(function() {

  	var numToSkip_Pinned = 0, numToShow_Pinned = 5;

	var getContent = function(d) {
		var content = "", linebreak = " <br /> ";
	
		content += d.title ? d.title : "Assignment " + d.assignmentNumber;
		content += linebreak + linebreak;
		content += d.email + linebreak + linebreak;
		content += "Type: " + d.vistype + linebreak + linebreak;
		content += d.description + linebreak + linebreak;
	
		return content;
	};

	var initGallery = function(data) {
		var assignmentWindow = d3.select("#recentAssigns")
			.selectAll(".assignment-preview")
			.data(data)
			.enter()
			.append("a")
			.attr("href", function(d) {
				return "/assignmentByEmail/"+ d.assignmentID + "/" + d.email; 
			})
			.append("div")
			.classed("assignment-preview", true)
			.on('mouseover', function(evt, d) {
				d3.select(this).classed("hover", true);
			})
			.on('mouseout', function(evt, d) {
				d3.select(this).classed("hover", false);
			});

		assignmentWindow.append("div")
			.classed("assignment-text", true)
			.html(function(d, i) { 
				return getContent(d); 
			});
	
	    assignmentWindow.append("div")
			.classed("assignment-image", true)
			.append('img')
			.attr('class', 'picture')
			.classed("visimg", true)
			.attr('src', function(d) {
console.log("vis type:" + d.vistype);
				if (d.vistype == "Alist")
					return '/img/array.png';
				else if(d.assignment_type && d.assignment_type.indexOf("Graph") >= 0)
					return '/img/graph.png';
				else if (d.vistype == "BarChart") 
					return '/img/BarChart.png';
				else if(d.vistype)
					return '/img/'+d.vistype+'.png';
				else
					return '/img/nodelink.png';
			});
	};


  var addToPinned = function(data) {
    var assignmentWindow = d3.select("#pinnedAssigns").selectAll(".assignment-preview")
          .data(data, function(d) { return d.assignmentNumber; });

    assignmentWindow.exit()
      .transition()
      .duration(750)
      .style("opacity", 0)
      .remove();

    var a = assignmentWindow.enter()
      .append("a")
        .attr("href", function(d) {return "/assignmentByEmail/"+ d.assignmentID + "/" + d.email; })
        .append("div")
          .classed("assignment-preview", true)
          .on('mouseover', function(evt, d) {
            d3.select(this).classed("hover", true);
          })
          .on('mouseout', function(evt, d) {
            d3.select(this).classed("hover", false);
          });



    a.append("div")
      .classed("assignment-text", true)
      .html(function(d, i) { return getContent(d); });

    a.append("div")
        .classed("assignment-image", true)
      .append('img')
        .attr('class', 'picture')
        .classed("visimg", true)
        .attr('src', function(d) {
          if(d.vistype == "Alist")
              return '/img/array.png';
          else if(d.assignment_type && d.assignment_type.indexOf("Graph") >= 0)
              return '/img/graph.png';
		  else if (d.vistype == "BarChart") 
				return '/img/BarChart.png';
          else if(d.vistype)
              return '/img/'+d.vistype+'.png';
          else
              return '/img/nodelink.png';
        });

    // add button if necessary
    d3.select("#morePinned").remove();
    d3.select("#pinnedAssigns")
        .append("button")
      .attr("id", "morePinned")
      .attr("class", "btn btn-primary")
      .text("Load more assignments")
      .on("click", function() {
        numToSkip_Pinned += numToShow_Pinned;
        getPinned(addToPinned, numToShow_Pinned, numToSkip_Pinned);
      });

    // // otherwise, update its attributes
    // else {
    //   d3.select("#morePinned").on("click", function() {
    //     numToSkip_Pinned += numToShow_Pinned;
    //     getPinned(addToPinned, numToShow_Pinned, numToSkip_Pinned);
    //   });
    // }


  };


  // grab recent uploads from the server
  var getRecent = function(cb, number, skipCount){
    var num = 5,
        skip = 0;
    if(number && number > 0)
      num = number;
    if(skipCount && skipCount >= 0)
      skip = skipCount;

    $.ajax({
        url: "/index/recentUploads?num=" + num + "&skip=" + skip,
        type: "GET",
        success: function(data, status, jqXHR) {
            if (jqXHR.status == "204") {
              console.log("-- no recent assignments found");
              return;
            }
            cb(data);
        },
        error: function (request, status, error)  {
          console.log(request.responseText);
        }
    });
  };

  // grab recent uploads from the server
  var getPinned = function(cb, number, skipCount){
    var num = 5,
        skip = 0;
    if(number && number > 0)
      num = number;
    if(skipCount && skipCount >= 0)
      skip = skipCount;

    $.ajax({
        url: "/index/pinnedUploads?num=" + num + "&skip=" + skip,
        type: "GET",
        success: function(data, status, jqXHR) {
            if (jqXHR.status == "204") {
              console.log("-- no pinned assignments found");
              return;
            }
            cb(data);
        },
        error: function (request, status, error)  {
          console.log(request.responseText);
        }
    });
  };


  getRecent(initGallery, 10);
  getPinned(addToPinned, numToShow_Pinned);
})
// calling this function to set up the initial gallery
();
