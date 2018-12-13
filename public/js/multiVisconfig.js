(function() {

// bind event handlers for ui
d3.selectAll("#collapse").on("click", collapse);
d3.select("#reset").on("click", reset);
// d3.select("#save").on("click", savePositions);
d3.select("#delete").on("click", deleteAssignment);
d3.select("#nodelabels").on("click", BridgesVisualizer.displayNodeLabels);
d3.select("#linklabels").on("click", BridgesVisualizer.displayLinkLabels);
d3.select("#toggleDisplay").on("click",
toggleDisplay);
d3.select("#assignmentSlideButton1").on("click", prevVis);
d3.select("#assignmentSlideButton2").on("click", nextVis);

var key = 0;


BridgesVisualizer.visualizations = [];

var ele = document.getElementById("vis0"),
    width = ele.clientWidth,
    height = ele.clientHeight,
    transform = assignment.transform;


visualizeAssignment(assignment);

function collapse() {
  d3.event.preventDefault();
}

// Reset positions and scales for all visualization divs
function reset() {
  d3.event.preventDefault();
  BridgesVisualizer.visualizations.forEach(function(d) {
    d.reset();
  });
}

function deleteAssignment() {
  d3.event.preventDefault();
  var r = confirm("Are you sure you want to delete this assignment?");
  if (r === true) {
      // send delete request
      $.ajax({
          url: "/assignments/"+assignmentNumber,
          type: "DELETE",
          success: function(status) {
              window.location = '../../username';
          }
      });
  }
}

function toggleDisplay() {
  d3.event.preventDefault();
  var newMode = (displayMode == "slide") ? "stack" : "slide";
  window.location = "/assignments/"+assignment.assignmentNumber+"/"+assignment.username+"?displayMode="+newMode;
}

// Asynchronously update the node positions
// function savePositions () {
//   d3.event.preventDefault();
//   return;
//
//   var updateTheseNodes = {};
//
//
//
//   // store indices for all fixed nodes
//   if (assignment && (assignment.vistype == "nodelink" || assignment.vistype == "nodelink-canvas")) {
//     updateTheseNodes[key] = {
//       'fixedNodes': {},
//       'unfixedNodes': {}
//     };
//   }
//
//   if (data.hasOwnProperty(key) && data[key].vistype == "nodelink") {
//     d3.select("#vis" + key).selectAll(".node").each(function(d, i) {
//       // we need to name the nodes so we can identify them on the server; indices don't suffice
//       if(d.fx && d.fy) {
//         updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.fx, "y": d.fy};
//       }
//       else updateTheseNodes[key].unfixedNodes["n" + i] = true;
//     });
//   } else if(data.hasOwnProperty(key) && data[key].vistype == "nodelink-canvas") {
//     BridgesVisualizer.visualizations[key].nodes.forEach(function(d, i) {
//       if(d.fx && d.fy) {
//         updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.fx, "y": d.fy};
//       }
//       else updateTheseNodes[key].unfixedNodes["n" + i] = true;
//     });
//   }
//
//   // send fixed node indices to the server to save
//   $.ajax({
//       url: "/assignments/updatePositions/"+assignmentNumber,
//       type: "post",
//       data: updateTheseNodes
//   }).done(function(status) {
//       if(status == 'OK'){
//           alertMessage("Node positions saved!", "success");
//       } else {
//           alertMessage("Unsuccessful. Try logging in!", "danger");
//       }
//   });
// }

//Asynchronously update the vis transform values
//this method is just for testing, if approved, it still needs the ajax call and routing set up as well as the dabatase.
//It also can be used with the tree visualization
// function saveTransform(){
//     var visTransforms = {};
//     for (var key in data) {
//         var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));
//         visTransforms[key] = {
//           "scale": parseFloat(my_transform.scale[0]),
//           "translatex": parseFloat(my_transform.translate[0]),
//           "translatey": parseFloat(my_transform.translate[1])
//         };
//     }
//     // console.log(visTransforms);
//     // send scale and translation data to the server to save
//     $.ajax({
//         url: "/assignments/updateTransforms/"+assignmentNumber,
//         type: "post",
//         data: visTransforms
//     }).done(function(status) {
//         if(status == 'OK'){
//             alertMessage("Scale and translation saved!", "success");
//         } else {
//             alertMessage("Unsuccessful. Try logging in!", "danger");
//         }
//     });
// }

/*
 Create a tooltip from the given message and status
 status: success, danger, warning
*/
function alertMessage(message, status) {
  var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
  $("#updateStatus").html(message+"<br>"+today);
  $("#updateStatus").addClass("alert alert-" + status);
  $("#updateStatus").show();
  setTimeout(function(){
     $("#updateStatus").hide();
  },2500);
}

// Saved the translate and scale of every visualization in an assignemts
// function saveVisStatesAsCookies(){
//     // console.log(this);
//     var exdays = 30;
//     try{
//       for (var key in data) {
//           var cookieName = "vis"+key+"-"+location.pathname;
//           var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));
//
//           var cookieValue = JSON.stringify({
//             "scale": parseFloat(my_transform.scale[0]),
//             "translatex": parseFloat(my_transform.translate[0]),
//             "translatey": parseFloat(my_transform.translate[1])
//           });
//           var d = new Date();
//           d.setTime(d.getTime() + (exdays*24*60*60*1000));
//           var expires = "expires=" + d.toGMTString();
//           document.cookie = cookieName+"="+cookieValue+"; "+expires;
//       }
//       var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
//       //  alertMessage("Scale and translation saved!", "success");
//     } catch(err){
//       console.log(err);
//     }
// }

function isOnScreen(elem) {
	// if the element doesn't exist, abort
	if( elem.length === 0 ) {
		return;
	}
	var $window = jQuery(window);
	var viewport_top = $window.scrollTop();
	var viewport_height = $window.height();
	var viewport_bottom = viewport_top + viewport_height;
	var $elem = jQuery(elem);
	var top = $elem.offset().top;
	var height = $elem.height();
	var bottom = top + height;

	return (top >= viewport_top && top < viewport_bottom) ||
	(bottom > viewport_top && bottom <= viewport_bottom) ||
	(height > viewport_height && top <= viewport_top && bottom >= viewport_bottom)
}

// on scroll, load the currently visible visualization
jQuery( document ).ready( function() {
	window.addEventListener('scroll', function(e) {
    for(var i = 0; i < assignment.numSubassignments; i++) {
    	if( isOnScreen(jQuery('#vis'+i)) && unloaded(i) ) {
        updateVis(i, i);
      }
    }
	});
});

// return true if the (i)th assignment is not loaded yet
function unloaded(i) {
  return (d3.select("#svg"+i).node() == null);
}

// Update default transforms that rely on window sizes
$(window).resize(function() {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function(){
        BridgesVisualizer.defaultTransforms.graph.translate = BridgesVisualizer.visCenter();
        BridgesVisualizer.defaultTransforms.nodelink.translate = BridgesVisualizer.visCenter();

        // resize svg-based assignments
        d3.selectAll("svg")
          .style("width", ele.clientWidth)
          .style("height", ele.clientHeight);

        // resize canavs-based assignments or assignments with specific resize methods
        BridgesVisualizer.visualizations.forEach(function(d) {
          if(d.resize) d.resize();
        });
    }, 250);
});


var currentVisNum = 0;
var assignNum = 100;
function prevVis(){
  if(currentVisNum == 0){
  }else{
    currentVisNum -= 1;
    updateVis(currentVisNum);
  }
}

function nextVis(){
  if(currentVisNum == assignNum){
  }else{
    currentVisNum += 1;
    updateVis(currentVisNum);
  }
}

function updateVis(currentNum, index){
  var username = assignment.username;
  var number = assignmentNumber;

  if(currentNum < 10)
    number += ".0" + currentNum;
  else
    number += "." + currentNum;

  $.ajax({
      url: "/assignmentjson/" + number + "/" + username,
      type: "get"
    }).fail(function(err) {
      assignNum = currentNum-1;
      currentVisNum -= 1;
    }).done(function(assignment) {
      // update the subassignment navigation display
      d3.select("#currentSubassignment").text(assignment.assignmentNumber + "." + assignment.subAssignment);

      // if necessary, import the relevant script
      if(assignment.resources && assignment.resources.script && !isLoaded(assignment.resources.script)) {
        addScript({
            src: assignment.resources.script,
            type: 'text/javascript',
            async: null
        }, "", function(){
          // then visualize the assignment
          visualizeAssignment(assignment, index);
        });
      } else {
        // otherwise, just visualize the assignment
        visualizeAssignment(assignment, index);
      }
    });
}

// load visualization scripts
function addScript(attribute, text, callback) {
    var s = document.createElement('script');
    for (var attr in attribute) {
        s.setAttribute(attr, attribute[attr] ? attribute[attr] : null)
    }
    s.innerHTML = text;
    s.onload = callback;
    document.body.appendChild(s);
}

function isLoaded(script) {
  return document.querySelectorAll("script[src='" + script + "']").length > 0;
}

function visualizeAssignment(assignment, index){
  console.log(index, assignment);
  // if no index provided, assume assignmentSlide view
  if(!index) {
    index = 0;
  }

  vis = d3.select("#vis"+index);
  vis.selectAll("*").remove();
  vis = vis.append("svg")
    .attr("id", "svg"+index);

  // update the title and description
  d3.select("#title"+index).text(function() {
    if(assignment.title && assignment.title.length > 0)
      return assignment.title;
    return "Assignment " + assignment.assignmentNumber;
  });
  d3.select("#description"+index).text(function() {
    if(assignment.description && assignment.description.length > 0)
      return assignment.description;
  });

  // get the data for the current assignment
  var assignmentData = assignment.data[0];
  // console.log(assignment, assignmentData);

  // render the appropriate visualization
  if (assignment.vistype == "tree" && d3.bst) {
      bst = d3.bst(vis, width, height);
      bst.make(assignmentData.nodes);
      BridgesVisualizer.visualizations.push(bst);
  }
  else if (assignment.vistype == "Alist" && d3.array) {
        array = d3.array(vis, width, height, assignmentData.nodes);
        BridgesVisualizer.visualizations.push(array);
  }
  else if (assignment.vistype == "Array2D" && d3.array2d) {
        array2d = d3.array2d(vis, width, height, assignmentData.nodes, assignmentData.dims);
        BridgesVisualizer.visualizations.push(array2d);
  }
  else if (assignment.vistype == "Array3D" && d3.array3d) {
        array3d = d3.array3d(vis, width, height, assignmentData.nodes, assignmentData.dims);
        BridgesVisualizer.visualizations.push(array3d);
  }
  else if (assignment.vistype == "grid" && d3.grid) {
    d3.select("#vis0").select("#svg0").remove("*");
    vis = d3.select("#vis" + key).append("canvas")
      .attr("id", "vis0");
      d3.grid(vis, width, height, assignmentData, d3.select("#vis0"));
  }
  else if (assignment.vistype == "nodelink" && d3.graph) {
      graph = d3.graph(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(graph);

      // // handle map overlay for subassignment if appropriate
      // if(assignmentData.map_overlay) {
      //   BridgesVisualizer.map(vis, assignmentData.coord_system_type);
      // }
  }
  else if (assignment.vistype == "nodelink-canvas" && d3.graph_canvas) {
      d3.select("#vis0").select("#svg0").remove("*");
      vis = d3.select("#vis" + key).append("canvas")
        .attr("id", "vis0");
      graph = d3.graph_canvas(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(graph);
  }
  else if (assignment.vistype == "collection" && d3.collection) {

      collection = d3.collection(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(collection);
  }
  else {
    console.log(assignment);
    return;
      // console.log("unknown data type");
      graph = d3.graph(d3, "#vis" + key, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(graph);
  }
}


})();
