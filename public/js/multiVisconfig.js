(function() {

// bind event handlers for ui
d3.selectAll("#collapse").on("click", collapse);
d3.select("#reset").on("click", reset);
d3.select("#save").on("click", savePositions);
d3.select("#delete").on("click", deleteAssignment);
d3.select("#nodelabels").on("click", BridgesVisualizer.displayNodeLabels);
d3.select("#linklabels").on("click", BridgesVisualizer.displayLinkLabels);
d3.select("#toggleDisplay").on("click",
toggleDisplay);

var key = 0;
var subAssignmentNumber = 0; // subassignment number

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
  for(var subassign in BridgesVisualizer.visualizations) {
    BridgesVisualizer.visualizations[subassign].reset();
  }
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


// Asynchronously update all node positions
function savePositions () {
  d3.event.preventDefault();

  var thisVis;
  var updateTheseNodes = {};

  for(var index in BridgesVisualizer.visualizations) {
    // store indices for all fixed nodes
    updateTheseNodes[index] = {
      'fixedNodes': {},
      'unfixedNodes': {}
    };

    // get appropriate assignment container based on subassignment
    if(index.substr(0,1) == "0") {
      thisVis = +index.substr(1);
    } else {
      thisVis = +index;
    }

    // svg case
    if(d3.select("#vis" + thisVis).select("#canvas"+thisVis).empty() && !d3.select("#vis" + thisVis).select("#svg"+thisVis).empty()) {
      d3.select("#svg" + thisVis).selectAll(".node").each(function(d, i) {
        if(d.fx && d.fy) {
          updateTheseNodes[index].fixedNodes["n" + i] = {"x": d.fx, "y": d.fy};
        }
        else updateTheseNodes[index].unfixedNodes["n" + i] = true;
      });
    } else if(!d3.select("#vis" + thisVis).select("#canvas"+thisVis).empty()) {
      // canvas case
      BridgesVisualizer.visualizations[index].nodes.forEach(function(d, i) {
        if(d.fx && d.fy) {
          updateTheseNodes[index].fixedNodes["n" + i] = {"x": d.fx, "y": d.fy};
        }
        else updateTheseNodes[index].unfixedNodes["n" + i] = true;
      });
    }
  }

  // send fixed node indices to the server to save
  $.ajax({
      url: "/assignments/updatePositions/"+assignmentNumber,
      type: "post",
      data: updateTheseNodes
  }).done(function(status) {
      if(status == 'OK'){
          alertMessage("Node positions saved!", "success");
      } else {
          alertMessage("Unsuccessful. Try logging in!", "danger");
      }
  });
}

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
$( document ).ready( function() {
	window.addEventListener('scroll', throttled(250, function(e) {
    for(var i = 0; i < assignment.numSubassignments; i++) {
    	if( isOnScreen(jQuery('#vis'+i)) && unloaded(i) ) {
        updateVis(i, i);
      }
    }
	}));
});

// return true if the (i)th assignment is not loaded yet
function unloaded(i) {
  // console.log(i, d3.select("#svg"+i).node());
  return (d3.select("#svg"+i).node() == null) && (d3.select("#canvas"+i).node() === null);
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
        for(var subassign in BridgesVisualizer.visualizations) {
          if(BridgesVisualizer.visualizations[subassign].resize)
            BridgesVisualizer.visualizations[subassign].resize();
        }
    }, 250);
});


window.onkeydown = function(e) {
    e = e || window.event;
    if (e.keyCode == '37') {
       // left arrow
       prevVis();
    }
    else if (e.keyCode == '39') {
       // right arrow
       nextVis();
    }
};

function prevVis(){
  if(subAssignmentNumber > 0) {
    updateVis(--subAssignmentNumber);
  }
}

function nextVis(){
  if(subAssignmentNumber < assignment.numSubassignments-1) {
    updateVis(++subAssignmentNumber);
  }
}

// bind assignment slide buttons if appropriate
(function() {
  d3.selectAll(".slideButton").on("click", slideButtonClick);
  d3.selectAll(".slideButton").on("mouseover", slideButtonHover);
  d3.selectAll(".slideButton").on("mouseout", slideButtonOut);

  positionSlideLabel(0);
})();


function slideButtonClick(d, i) {
  updateVis(i);
}
function slideButtonHover(d, i) {
  positionSlideLabel(i);
}
function slideButtonOut(d, i) {
  positionSlideLabel(subAssignmentNumber);
}
function positionSlideLabel(i) {
  i = +i;
  d3.select("#currentSubassignment")
    .text(assignment.assignmentNumber + "." + ((i < 10) ? "0"+i : i))
    .style("left", function() {
      var b = d3.select("#slideButton"+i);
      // return b.node().offsetLeft + (b.node().clientWidth / 3) + "px";
      return b.node().offsetLeft + "px";
    })
    .style("top", function() {
      var b = d3.select("#slideButton"+i);
      return b.node().offsetTop - 25 + "px";
    });
}

function updateVis(currentNum, index){
  var username = assignment.username;
  var number = assignmentNumber;
  if(currentNum < 10)
    number += ".0" + currentNum;
  else
    number += "." + currentNum;

  subAssignmentNumber = currentNum;

  $.ajax({
      url: "/assignmentjson/" + number + "/" + username,
      type: "get"
    }).fail(function(err) {
      assignNum = currentNum-1;
      currentVisNum -= 1;
    }).done(function(assignment) {
      var wait = false;

      // update the subassignment navigation display
      positionSlideLabel(assignment.subAssignment);

      // add map resources if appropriate
      if(assignment.data && assignment.data[0] && assignment.data[0].map_overlay) {
        importMapResources();
      }

      // if necessary, import the relevant scripts
      if(assignment.resources && assignment.resources.script) {
        for(var s in assignment.resources.script) {
          var script = assignment.resources.script[s];
          if (!isLoaded(script)) {
            if(script == "/js/graph-canvas.js") {
              wait = true;
            }
            addScript({
                src: script,
                type: 'text/javascript',
                async: null
            }).then(function(data) {
            });
          }
        }
      }

      // visualize the assignment
      setTimeout(function() { visualizeAssignment(assignment, index); }, 250);
    });
}

function addScript(src) {
    return new Promise(function (resolve, reject) {
        if(isLoaded(src.src)) return resolve();
        var s;
        s = document.createElement('script');
        for (var attr in src) {
            s.setAttribute(attr, src[attr] ? src[attr] : null);
        }
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

function isLoaded(script) {
  return document.querySelectorAll("script[src='" + script + "']").length > 0;
}

function visualizeAssignment(assignment, index){

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

  // render the appropriate visualization
  if (assignment.vistype == "tree" && d3.bst) {
      bst = d3.bst(vis, width, height);
      bst.make(assignmentData.nodes);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (bst);
  }
  else if (assignment.vistype == "Alist" && d3.array) {
      array = d3.array(vis, width, height, assignmentData.nodes);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (array);
  }
  else if (assignment.vistype == "Array2D" && d3.array2d) {
      array2d = d3.array2d(vis, width, height, assignmentData.nodes, assignmentData.dims);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (array2d);
  }
  else if (assignment.vistype == "Array3D" && d3.array3d) {
      array3d = d3.array3d(vis, width, height, assignmentData.nodes, assignmentData.dims);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (array3d);
  }
  else if (assignment.vistype == "grid" && d3.grid) {
      d3.select("#vis"+index).select("#svg"+index).remove("*");
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas"+index);
        d3.grid(vis, width, height, assignmentData, d3.select("#canvas"+index));
  }
  else if (assignment.vistype == "nodelink" && d3.graph) {
      graph = d3.graph(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (graph);
  }
  else if (assignment.vistype == "nodelink-canvas" && d3.graph_canvas) {
      d3.select("#vis"+index).select("#svg"+index).remove("*");
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas"+index);
      graph = d3.graph_canvas(vis, width, height, assignmentData);

      BridgesVisualizer.visualizations[assignment.subAssignment] = (graph);
      console.log(graph);
  }
  else if (assignment.vistype == "collection" && d3.collection) {
      collection = d3.collection(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (collection);
  }
  else {
    console.log('error..', assignment);
    return;
      // console.log("unknown data type");
      graph = d3.graph(d3, "#vis" + index, width, height, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (graph);
  }

  // handle map overlay for subassignment if appropriate
  if(assignment.data[0] && assignment.data[0].map_overlay) {
    addMapOverlay(assignmentData, vis);
  }
}

// import map-related scripts and styles
function importMapResources() {
  return new Promise(function(resolve, reject) {

    // if resources are already loaded, resolve immediately.
    if(d3.graph_canvas && d3.graph) {
      return resolve();
    }

    // import map css file
    $('head').append('<link rel="stylesheet" type="text/css" href="/css/map.css">');

    addScript({
        src: "/js/map.js",
        type: 'text/javascript',
        async: null
    }).then(function() {
      return addScript({
          src: "/js/map-canvas.js",
          type: 'text/javascript',
          async: null
        });
    }).then(function() {
      return addScript({
          src: "/js/lib/topojson.v1.min.js",
          type: 'text/javascript',
          async: null
        });
    }).then(function() {
      resolve();
    });
  });
}

// add a map overlay for the given subassignment
function addMapOverlay(assignmentData, vis) {

  importMapResources().then(function() {
    // call the correct map overlay (svg, CANVAS)
    switch(vis.node().tagName) {
      case 'svg':
        BridgesVisualizer.map(vis, assignmentData.coord_system_type);
        break;

      case 'CANVAS':
        BridgesVisualizer.map_canvas(vis, assignmentData.coord_system_type);
        break;
    }
  });
}

function throttled(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

})();
