(function() {

// bind event handlers for ui
d3.selectAll("#collapse").on("click", collapse);
d3.select("#reset").on("click", reset);
d3.select("#hideNodes").on("click", function(){
  if(BridgesVisualizer.nodes_shown === false){
    BridgesVisualizer.nodes_shown = true;
  }else{
    BridgesVisualizer.nodes_shown = false;
  }
  BridgesVisualizer.displayNodes();
});

d3.select("#hideLinks").on("click", function(){
  if(BridgesVisualizer.links_shown === false){
    BridgesVisualizer.links_shown = true;
  }else{
    BridgesVisualizer.links_shown = false;
  }
  BridgesVisualizer.displayLinks();
});

d3.select("#save").on("click", savePositions);
d3.select("#delete").on("click", deleteAssignment);
d3.select("#nodelabels").on("click",function(){
  if(BridgesVisualizer.labels_shown === false){
    BridgesVisualizer.labels_shown = true;
  }else{
    BridgesVisualizer.labels_shown = false;
  }
  BridgesVisualizer.displayNodeLabels();
});

d3.select("#linklabels").on("click", function(){
  if(BridgesVisualizer.link_labels_shown === false){
    BridgesVisualizer.link_labels_shown = true;
  }else{
    BridgesVisualizer.link_labels_shown = false;
  }
  BridgesVisualizer.displayLinkLabels()

});
d3.select("#toggleDisplay").on("click", toggleDisplay);
d3.select("#resetit").on("click", nextVis);
d3.select("#play").on("click", playVis);
d3.select("#stop").on("click", stopVis);

var key = 0;
var subAssignmentNumber = 0; // subassignment number
var intervalId;
var playing = false;

//toggles for labels within the visualization
BridgesVisualizer.labels_shown = assignment.data[0].element_label_flag;
BridgesVisualizer.link_labels_shown = assignment.data[0].link_label_flag;
BridgesVisualizer.nodes_shown = true;
BridgesVisualizer.links_shown = true;

BridgesVisualizer.visualizations = [];

var ele = document.getElementById("vis0"),
    width = ele.clientWidth,
    height = ele.clientHeight,
    transform = assignment.transform;

visualizeAssignment(assignment);

function collapse(evt) {
  evt.preventDefault();
}

// Reset positions and scales for all visualization divs
function reset(evt) {
  evt.preventDefault();
  for(var subassign in BridgesVisualizer.visualizations) {
    BridgesVisualizer.visualizations[subassign].reset();
  }
}

function deleteAssignment(evt) {
  evt.preventDefault();
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

function toggleDisplay(evt) {
  evt.preventDefault();
  newMode = (displayMode == "slide") ? "stack" : "slide";
  window.location = "/assignments/"+assignment.assignmentNumber+"/"+assignment.username+"?displayMode="+newMode;

}


// Asynchronously update all node positions
function savePositions (evt) {
  evt.preventDefault();

  var thisVis;
  var updateTheseNodes = {};

  for(var index in BridgesVisualizer.visualizations) {

    // get appropriate assignment container based on subassignment and display mode
    if(displayMode == "slide") {
      if(index != subAssignmentNumber) continue; // only save current vis in slide mode
      thisVis = 0;
    } else if(displayMode == "stack") {
      if(index.substr(0,1) == "0") {
        thisVis = +index.substr(1);
      } else {
        thisVis = +index;
      }
    }

    // store indices for all fixed nodes
    updateTheseNodes[index] = {
      'fixedNodes': {},
      'unfixedNodes': {}
    };

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
  }).done(function(data, textStatus, xhr) {
      if(xhr.status == '202'){
          alertMessage("Node positions saved!", "success");
      } else {
          alertMessage("Unsuccessful. Try logging in!", "danger");
      }
  });
}

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
	window.addEventListener('scroll', debounce(function(e) {
    for(var i = 0; i < assignment.numSubassignments; i++) {
    	if( isOnScreen(jQuery('#vis'+i)) && unloaded(i) ) {
        updateVis(i, i);
      }
    }
	}, 100));
});

// return true if the (i)th assignment is not loaded yet
function unloaded(i) {
  // console.log(i, d3.select("#svg"+i).node());
    return (d3.select("#svg"+i).node() == null)
	&& (d3.select("#canvas"+i).node() === null && d3.select("#vis"+i).select(".highcharts-container").empty())
	&& (d3.select("#canvas_webgl"+i).node() == null);
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

function stopVis(){
  clearInterval(intervalId)
  playing = false
}

function playVis(){
  if(assignment.numSubassignments > 1){
    if(!playing){
      playing = true
      intervalId = window.setInterval(function(){
      nextVis()
      if(subAssignmentNumber == assignment.numSubassignments-1){
        clearInterval(intervalId)
        playing = false
      }
    }, 1000);
    }

  }
}

function delay(){
  var millisecondsToWait = 500;
  setTimeout(function() {
      nextVis();
  }, millisecondsToWait);
}

// bind assignment slide buttons if appropriate
(function() {
  d3.selectAll(".slideButton").on("click", debounce(slideButtonClick, 100));
  d3.selectAll(".slideButton").on("mouseover", slideButtonHover);
  d3.selectAll(".slideButton").on("mouseout", slideButtonOut);

  positionSlideLabel(0);
})();


function slideButtonClick(evt) {
//this uses .target and not .currentTarget because this functoin is not called in the event handler but in a timeout function which undefined currentTarget. Javascript, am I right?
var i=evt.target.id.substring("slideButton".length); //we need i to be the index of the button which we can derie from how its HTML id got set
  updateVis(i);
}
function slideButtonHover(evt) {
var i=evt.currentTarget.id.substring("slideButton".length); //we need i to be the index of the button which we can derie from how its HTML id got set
  positionSlideLabel(i);
}
function slideButtonOut(evt, datum) {
  positionSlideLabel(subAssignmentNumber);
}
function positionSlideLabel(i) {
  i = +i;
  d3.select("#currentSubassignment")
    .text(assignment.assignmentNumber + "." + ((i < 10) ? "0"+i : i))
    .style("left", function() {
      var b = d3.select("#slideButton"+i);
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
      setTimeout(function() { visualizeAssignment(assignment, index); }, 100);
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

  // modify vis dimensions
  d3.select("#vis"+index)
    .style("width", width + 'px')
    .style("margin-left", "15px");

  // modify assignmentSlide nav menu
  d3.select("#assignmentSlide")
    .style("width", width + 'px')
    .style("margin-left", "15px");

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
        d3.grid(vis, width, height, assignmentData, d3.select("#vis"+index));
  }
  else if (assignment.vistype == "nodelink" && d3.graph) {
      graph = d3.graph(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (graph);
  }
  else if (assignment.vistype == "nodelink-canvas" && d3.graph_canvas) {
      d3.select("#vis"+index).select("#svg"+index).remove("*");
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas"+index);

      graph_canvas = d3.graph_canvas(vis, width, height, assignmentData);

      BridgesVisualizer.visualizations[assignment.subAssignment] = (graph_canvas);
  }
  else if (assignment.vistype == "graph-webgl" && d3.graph_webgl) {
      d3.select("#vis"+index).select("#svg"+index).remove("*");
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas_webgl"+index);
      graph_webgl = d3.graph_webgl(vis, width, height, assignmentData);

      BridgesVisualizer.visualizations[assignment.subAssignment] = (graph_webgl);
  }
  else if (assignment.vistype == "scene" && d3.scene_webgl) {
      d3.select("#vis"+index).select("#svg"+index).remove("*");
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas_webgl"+index);
      scene = d3.scene_webgl(vis, width, height, assignmentData);

      BridgesVisualizer.visualizations[assignment.subAssignment] = (scene);
  }
  else if (assignment.vistype == "collection" && d3.collection) {
      collection = d3.collection(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (collection);
  }
  else if (assignment.vistype == "collectionv2" && d3.collectionv2) {
      collectionv2 = d3.collectionv2(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (collectionv2);
  }
  else if (assignment.vistype == "LineChart" && d3.lineChart){
      plot = d3.lineChart(vis, "vis" + index, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (plot);
  }
  else if (assignment.vistype == "BarChart" && d3.barChart){
      barchart = d3.barChart(vis, "vis" + index, assignmentData);
      BridgesVisualizer.visualizations[assignment.subAssignment] = (barchart);
  }
  else if (assignment.vistype == "Audio"){
      d3.select("#vis" + index).select("#svg"+index).remove("*");
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas_webgl_overview")
        .attr("width", 1080)
        .attr("height", 150);
      vis = d3.select("#vis" + index).append("canvas")
        .attr("id", "canvas_webgl"+index);
      audio = d3.audio_webgl(vis, width, height, assignmentData);

      BridgesVisualizer.visualizations[assignment.subAssignment] = (audio);
  }
  else {
    console.log('error..', assignment);

    var errorDiv = d3.select("#vis"+index).append("div").attr("id", "errorDiv");

    if(assignment.vistype == "gamegrid") {
      errorDiv.html("This assignment does not work with this version of Bridges. Perhaps try the <a href=\"https://bridges-games.herokuapp.com/assignments/" + assignment.assignmentNumber + "/" + assignment.username + "\"> games server? </a>");
    } else {
      errorDiv.text("This assignment does not seem to be working :(");
    }
    return;
  }

  // handle map overlay for subassignment if appropriate
  if(assignment.data[0] && assignment.data[0].map_overlay) {
    addMapOverlay(assignmentData, vis);
  }

  // update the subassignment navigation display
  positionSlideLabel(assignment.subAssignment);
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
//	src: "/js/map.js",
	src: "/js/map_gen.js",
        type: 'text/javascript',
        async: null
/*
    }).then(function() {
      return addScript({
          src: "/js/map-canvas.js",
          type: 'text/javascript',
          async: null
        });
*/
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
      //we now pass the area to render from map as assignmentData.map: example-North Carolina
        BridgesVisualizer.map(vis, assignmentData.coord_system_type, assignmentData.coord_system_type, assignmentData.map);
        break;

      case 'CANVAS':
        BridgesVisualizer.map_canvas(vis, assignmentData.coord_system_type, assignmentData.coord_system_type, assignmentData.map);
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

// debounce an event (only trigger after a period of time)
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}


})();
