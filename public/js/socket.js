(function() {
  if(user) {
    console.log(user.username+"_"+assignmentNumber);
  } else {
    console.log("NOT LOGGED IN, NO SOCKETS FOR YOUUU");
    return;
  }

  var socket = io.connect('https://bridges-sockets.herokuapp.com');

  // var socket = io.connect('localhost:3000');

  socket.on('connect', function (data) {
    socket.emit('credentials', JSON.stringify({user: user.username, assignment: assignmentNumber}));
  });

  socket.on("disconnect", function (data) {
    console.log('disconnecting...', data);
  });

  socket.on('dataframe', function (dataframe) {
    console.log('new dataframe', dataframe);

    var cols = 10, rows = 10;

    d3.selectAll("rect").each(function(d, i) {
      // console.log(i);
      // console.log("I am column", Math.floor((i) / cols));
      var row = Math.floor((i) / cols);
      //
      // console.log("I am row", (i) % cols);
      var col = Math.floor((i) % cols);
      if(dataframe.dataframe[col][row] == 1) {
        d3.select(this).style("fill", "white");
      } else {
        d3.select(this).style("fill", "black");
      }
    });

  });

  socket.on('grid:send', function(gridData) {
    // find grid among visualizations?
    var grid = BridgesVisualizer.visualizations[0];

    var gridObj = JSON.parse(gridData.gridData);

    grid.setupNodes(gridObj);
    grid.draw();
  });

  $(document).keydown(function(e) {
    console.log(e);
      switch(e.key) {
          case "ArrowLeft":        //case 37: // left
            socket.emit('keydown', {key: "left"});
            break;

          case "ArrowUp":           //case 38: // up
            socket.emit('keydown', {key: "up"});
            break;

          case "ArrowRight":        //case 39: // right
            socket.emit('keydown', {key: "right"});
            break;

          case "ArrowDown":         //case 40: // down
            socket.emit('keydown', {key: "down"});
            break;

          default: return;
      }
      e.preventDefault();
  });
})();
