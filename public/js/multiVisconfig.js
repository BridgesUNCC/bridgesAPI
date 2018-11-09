(function() {

// bind event handlers for ui
d3.selectAll("#collapse").on("click", collapse);
d3.select("#reset").on("click", reset);
d3.select("#save").on("click", savePositions);
d3.select("#delete").on("click", deleteAssignment);
d3.select("#nodelabels").on("click", BridgesVisualizer.displayNodeLabels);
d3.select("#linklabels").on("click", BridgesVisualizer.displayLinkLabels);
d3.select("#assignmentSlideButtons1").on("click", prevVis);
d3.select("#assignmentSlideButtons2").on("click", nextVis);

var key = 0;

BridgesVisualizer.visualizations = [];

/* create new assignments  */
// for (var key in data) {
  // if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis0"),
        width = ele.clientWidth,
        height = ele.clientHeight,
        transform = data[key].transform,
        vis = d3.select("#vis0").append("svg")
          .attr("id", "svg0");

visualizeAssignment(data[0])
    //saving a copy of every assignment: type and key of the assignment. Useful when trying to reset them.
    // BridgesVisualizer.assignmentTypes.push(data[key]['vistype']);

    // if (data[key]['vistype'] == "tree" && d3.bst) {
    //     vis = d3.select("#vis" + key).append("svg")
    //       .attr("id", "vis" + key);
    //     bst = d3.bst(vis, width, height);
    //     bst.make(data[key]);
    //     BridgesVisualizer.visualizations.push(bst);
    // }
    // else if(data[key]['vistype'] == "dllist" && d3.dllist){
    //     d3.dllist(d3, "#vis" + key, width, height, sortNonCircularListByLinks(data[key]), transform);
    // }
    // else if(data[key]['vistype'] == "cdllist" && d3.cdllist){
    //     d3.cdllist(d3, "#vis" + key, width, height, sortCircularDoublyListByLinks(data[key]));
    // }
    // else if(data[key]['vistype'] == "llist" && d3.sllist){
    //     // d3.sllist(d3, "#vis" + key, width, height, sortNonCircularListByLinks(data[key]), transform);
    //     d3.sllist(d3, "#vis" + key, width, height, sortSLLists(data[key]), transform);
    // }
    // else if(data[key]['vistype'] == "cllist" && d3.csllist){
    //     d3.csllist(d3, "#vis" + key, width, height, sortCircularSinglyListByLinks(data[key]), transform);
    // }
    // else if (data[key]['vistype'] == "queue" && d3.queue) {
    //     d3.queue(d3, "#vis" + key, width, height, data[key].nodes, transform);
    // }
    // else if (data[key]['vistype'] == "Alist" && d3.array) {
    //       vis = d3.select("#vis" + key).append("svg")
    //         .attr("id", "vis" + key);
    //       array = d3.array(vis, width, height, data[key].nodes);
    //       BridgesVisualizer.visualizations.push(array);
    // }
    // else if (data[key]['vistype'] == "Array2D" && d3.array2d) {
    //       vis = d3.select("#vis" + key).append("svg")
    //         .attr("id", "vis" + key);
    //       array2d = d3.array2d(vis, width, height, data[key].nodes, data[key].dims);
    //       BridgesVisualizer.visualizations.push(array2d);
    // }
    // else if (data[key]['vistype'] == "Array3D" && d3.array3d) {
    //       vis = d3.select("#vis" + key).append("svg")
    //         .attr("id", "vis" + key);
    //       array3d = d3.array3d(vis, width, height, data[key].nodes, data[key].dims);
    //       BridgesVisualizer.visualizations.push(array3d);
    // }
    // else if (data[key]['vistype'] == "grid" && d3.grid) {
    //     vis = d3.select("#vis" + key).append("canvas")
    //       .attr("id", "canvas" + key);
    //     d3.grid(vis, width, height, data[key], d3.select("#vis" + key));
    // }
    // else if (data[key]['vistype'] == "nodelink" && d3.graph) {
    //     vis = d3.select("#vis0").append("svg")
    //       .attr("id", "vis0");
    //     graph = d3.graph(vis, width, height, data[key]);
    //     BridgesVisualizer.visualizations.push(graph);
    //
    //     // handle map overlay for subassignment if appropriate
    //     if(data[key].map_overlay) {
    //       BridgesVisualizer.map(vis, data[key].coord_system_type);
    //     }
    // }
    // else if (data[key].vistype == "nodelink-canvas" && d3.graph_canvas) {
    //     vis = d3.select("#vis" + key).append("canvas")
    //       .attr("id", "vis" + key);
    //     graph = d3.graph_canvas(vis, width, height, data[key]);
    //     BridgesVisualizer.visualizations.push(graph);
    // }
    // else if (data[key].vistype == "collection" && d3.collection) {
    //     vis = d3.select("#vis" + key).append("svg")
    //       .attr("id", "vis" + key);
    //     collection = d3.collection(vis, width, height, data[key]);
    //     BridgesVisualizer.visualizations.push(collection);
    // }
    // else {
    //   console.log(data[key]);
    //     // console.log("unknown data type");
    //     graph = d3.graph(d3, "#vis" + key, width, height, data[key]);
    //     BridgesVisualizer.visualizations.push(graph);
    // }
//   }
// }

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

// Asynchronously update the node positions
function savePositions () {
  d3.event.preventDefault();
  var updateTheseNodes = {};

  // store indices for all fixed nodes
  for (var key in data) {

    if (data.hasOwnProperty(key) && (data[key].vistype == "nodelink" || data[key].vistype == "nodelink-canvas")) {
      updateTheseNodes[key] = {
        'fixedNodes': {},
        'unfixedNodes': {}
      };
    }

    if (data.hasOwnProperty(key) && data[key].vistype == "nodelink") {
      d3.select("#vis" + key).selectAll(".node").each(function(d, i) {
        // we need to name the nodes so we can identify them on the server; indices don't suffice
        if(d.fx && d.fy) {
          updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.fx, "y": d.fy};
        }
        else updateTheseNodes[key].unfixedNodes["n" + i] = true;
      });
    } else if(data.hasOwnProperty(key) && data[key].vistype == "nodelink-canvas") {
      BridgesVisualizer.visualizations[key].nodes.forEach(function(d, i) {
        if(d.fx && d.fy) {
          updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.fx, "y": d.fy};
        }
        else updateTheseNodes[key].unfixedNodes["n" + i] = true;
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
function saveTransform(){
    var visTransforms = {};
    for (var key in data) {
        var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));
        visTransforms[key] = {
          "scale": parseFloat(my_transform.scale[0]),
          "translatex": parseFloat(my_transform.translate[0]),
          "translatey": parseFloat(my_transform.translate[1])
        };
    }
    // console.log(visTransforms);
    // send scale and translation data to the server to save
    $.ajax({
        url: "/assignments/updateTransforms/"+assignmentNumber,
        type: "post",
        data: visTransforms
    }).done(function(status) {
        if(status == 'OK'){
            alertMessage("Scale and translation saved!", "success");
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

// Saved the translate and scale of every visualization in an assignemts
function saveVisStatesAsCookies(){
    // console.log(this);
    var exdays = 30;
    try{
      for (var key in data) {
          var cookieName = "vis"+key+"-"+location.pathname;
          var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));

          var cookieValue = JSON.stringify({
            "scale": parseFloat(my_transform.scale[0]),
            "translatex": parseFloat(my_transform.translate[0]),
            "translatey": parseFloat(my_transform.translate[1])
          });
          var d = new Date();
          d.setTime(d.getTime() + (exdays*24*60*60*1000));
          var expires = "expires=" + d.toGMTString();
          document.cookie = cookieName+"="+cookieValue+"; "+expires;
      }
      var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
      //  alertMessage("Scale and translation saved!", "success");
    } catch(err){
      console.log(err);
    }
}

// Save cookies when scale and translation are updated
//  only updates zoom after scrolling has stopped
// try{
//     var wheeling = null;
//     $("svg").mouseup(saveVisStatesAsCookies);
//     $("svg").on('wheel', function (e) {
//       clearTimeout(wheeling);
//       wheeling = setTimeout(function() {
//         saveVisStatesAsCookies();
//         wheeling = undefined;
//       }, 250);
//     });
// }catch(err){
//     console.log(err);
// }

// function hideTooltip(){
//   BridgesVisualizer.tooltip.transition()
//       .duration(500)
//       .style("opacity", 0);
// }
//
// //toggle, show and hide all labels ".nodeLabel"
// $("body").on("keydown", function(event) {
//     if(event.which == "76"){
//         // hide tooltip
//         BridgesVisualizer.tooltip.transition()
//             .duration(500)
//             .style("opacity", 0);
//
//         // show tooltip
//         if($(".nodeLabel").length > 0 && (d3.selectAll(".nodeLabel").style("display") == "none" || d3.selectAll(".nodeLabel").style("opacity") == "0")){
//             d3.selectAll(".nodeLabel").style("display","block").style("opacity","1");
//             BridgesVisualizer.tooltipEnabled = false;
//         }else if($(".nodeLabel").length > 0){
//             d3.selectAll(".nodeLabel").style("display","none").style("opacity","0");
//             BridgesVisualizer.tooltipEnabled = true;
//         }
//     }
// });

//this methods sorts any Doubly Links linkedlist by links
function sortCircularSinglyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links,
        nodes = unsortedNodes.nodes,
        uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0,
        lastIndex;

    //O(n)
    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].source+"-"+links[i].target] = links[i];
        }
    }

    //this is expensive. Previous methods worked, but I find this way is safer.
    //but it only happens once
    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        if(a.split("-")[0] == b.split("-")[0]){
           if(parseInt(a.split("-")[1]) > parseInt(b.split("-")[1])){
              lastIndex = a;
           }else{
              lastIndex = b;
           }
        }
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });

    for(key in keys){
      nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
      sortedNodes.push(nodes[head]);
      head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
      sortedNodes.push(nodes[head]);
    }

    //this is O(1) since there is only one link from the last node to the first.
    for(key in uniqueBackwardLink){
      sortedNodes[sortedNodes.length-1]['forwardlink'] = uniqueBackwardLink[key];
    }

    return sortedNodes;
}

//this methods sorts any Doubly Links linkedlist by links
function sortCircularDoublyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links,
        nodes = unsortedNodes.nodes,
        uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0,
        lastIndex,
        lastElement;

    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
            if(links[i].source == 0 && links[i].target == nodes.length-1){
                nodes[links[i].source]['forwardlink'] = links[i];
                continue;
            }else{
                nodes[links[i].target]['backwardlink'] = links[i];
                continue;
            }

        }else{
            uniqueBackwardLink[links[i].source+"-"+links[i].target] = links[i];
            if(links[i].source == nodes.length-1 && links[i].target == 0){
                nodes[links[i].target]['backwardlink'] = links[i];
                continue;
            }else{
                nodes[links[i].source]['forwardlink'] = links[i];
                continue;
            }
        }
    }

    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        if(a.split("-")[0] == b.split("-")[0]){
           if(parseInt(a.split("-")[1]) > parseInt(b.split("-")[1])){
               lastIndexA = a;
               lastIndexB = b;
           }else{
               lastIndexA = a;
               lastIndexB = b;
           }
        }
        return parseInt(b.split("-")[0]) - parseInt(a.split("-")[0]);
    });

    for(var i = 0; i < keys.length; i++){
      sortedNodes.push(nodes[head]);
      head = uniqueForwardLink[keys[i]].target;
    }

    sortedNodes[lastIndexA.split("-")[1]] = nodes[lastIndexB.split("-")[1]];

    return sortedNodes;
}

//this methods sorts any Doubly Links linkedlist by links
function sortNonCircularListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links;
    var nodes = unsortedNodes.nodes;
    var uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0;
    // console.log(unsortedNodes, listType);

    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].target+"-"+links[i].source] = links[i];
        }
    }

    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });

    for(key in keys){
        nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
        sortedNodes.push(nodes[head]);
        head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
        sortedNodes.push(nodes[head]);
    }

    for(key in uniqueBackwardLink){
        if(sortedNodes[uniqueBackwardLink[key].target])sortedNodes[uniqueBackwardLink[key].target]['backwardlink'] = uniqueBackwardLink[key];
    }

    // console.log(sortedNodes);
    return sortedNodes;
}

// Sort old and new SLLists
//  O(n)
function sortSLLists(unsortedNodes) {
  var links = unsortedNodes.links,
      nodes = unsortedNodes.nodes,
      sortedNodes = [],
      forwardLinks = {},
      forwardLinkObjects = {},
      backwardLinks = {},
      curr = null;

  // Store all the forward and backward connections
  // O(n)
  for(var i in links) {
    forwardLinks[links[i].source] = links[i].target;
    forwardLinkObjects[links[i].source] = links[i];
    backwardLinks[links[i].target] = links[i].source;
  }

  // If there are no links, just return nodes
  if(links.length === 0)
    return nodes;


  // find the head node
  // O(n) in worst case (old llists)
  // O(1) in best case (new llist)
  for(var i in nodes) {
    if(!backwardLinks[i]) {
      nodes[i].forwardLink = forwardLinkObjects[i];
      curr = nodes[i].forwardLink.target;
      sortedNodes.push(nodes[i]);
      break;
    }
  }

  // add the rest of the nodes in link order
  // O(n)
  for(var i = 0; i < links.length-1; i++) {
      nodes[curr].forwardLink = forwardLinkObjects[curr];
      sortedNodes.push(nodes[curr]);
      curr = nodes[curr].forwardLink.target;
  }

  // add last node
  sortedNodes.push(nodes[curr]);

  return sortedNodes;
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

function updateVis(currentNum){
  var username = user.username;
    $.ajax({
        url: "/assignmentjson/" + assignmentNumber + ".0" + currentNum + "/" + username,
        type: "get"
      }).fail(function(err) {
        assignNum = currentNum-1;
        currentVisNum -= 1;
        return;
      }).done(function(assignment) {
        visualizeAssignment(assignment.assignmentJSON)
      });
}

function visualizeAssignment(assignmentData){
  d3.select("#svg0").selectAll("*").remove();
  vis = d3.select("#svg0");

  if (assignmentData['vistype'] == "tree" && d3.bst) {
      bst = d3.bst(vis, width, height);
      bst.make(assignmentData);
      BridgesVisualizer.visualizations.push(bst);
  }
  else if (assignmentData['vistype'] == "Alist" && d3.array) {
        array = d3.array(vis, width, height, assignmentData.nodes);
        BridgesVisualizer.visualizations.push(array);
  }
  else if (assignmentData['vistype'] == "Array2D" && d3.array2d) {
        array2d = d3.array2d(vis, width, height, assignmentData.nodes, assignmentData.dims);
        BridgesVisualizer.visualizations.push(array2d);
  }
  else if (assignmentData['vistype'] == "Array3D" && d3.array3d) {
        array3d = d3.array3d(vis, width, height, assignmentData.nodes, assignmentData.dims);
        BridgesVisualizer.visualizations.push(array3d);
  }
  else if (assignmentData['vistype'] == "grid" && d3.grid) {
      vis = d3.select("#vis" + key).append("canvas")
        .attr("id", "vis0");
      d3.grid(vis, width, height, assignmentData, d3.select("#vis0"));
  }
  else if (assignmentData['vistype'] == "nodelink" && d3.graph) {
    console.log('!', vis);
      graph = d3.graph(vis, width, height, assignmentData.data[0]);
      BridgesVisualizer.visualizations.push(graph);

      // // handle map overlay for subassignment if appropriate
      // if(assignmentData.map_overlay) {
      //   BridgesVisualizer.map(vis, assignmentData.coord_system_type);
      // }
  }
  else if (assignmentData.vistype == "nodelink-canvas" && d3.graph_canvas) {
      vis = d3.select("#vis" + key).append("canvas")
        .attr("id", "vis0");
      graph = d3.graph_canvas(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(graph);
  }
  else if (assignmentData.vistype == "collection" && d3.collection) {
      collection = d3.collection(vis, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(collection);
  }
  else {
    console.log(assignmentData);
      // console.log("unknown data type");
      graph = d3.graph(d3, "#vis" + key, width, height, assignmentData);
      BridgesVisualizer.visualizations.push(graph);
  }
}


})();
