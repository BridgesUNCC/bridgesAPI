(function() {
  if(user) {
    console.log(user.username+"_"+assignmentNumber);
  } else {
    console.log("NOT LOGGED IN, NO SOCKETS FOR YOUUU");
    return;
  }

  var socket = io.connect('https://bridges-sockets.herokuapp.com', {
    transports: ['websocket']
  });

  // var socket = io.connect('localhost:3000',{
  //   transports: ['websocket']
  // });

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

  var prevTime = Date.now();

  socket.on('gamegrid:send', function(gamegridData) {
    var currTime = Date.now();
    if(currTime-prevTime > 60) {
      console.log("Long time between gamegrid:send events:", currTime - prevTime);
    }
    prevTime = currTime;

    // find gamegrid among visualizations?
    var gamegrid = BridgesVisualizer.visualizations[0];
    var gamegridObj = JSON.parse(gamegridData.gridData);
    gamegrid.setupNodes(gamegridObj);
    gamegrid.draw();
  });

// use hashmap to keep track of what is currently down
// remove from hashmap once keyup happens -
// send keydown and keyup events
  var keys = {};

  $(document).keyup(function(e) {
    e.preventDefault();
    if(keys[e.keyCode]) {
      delete keys[e.keyCode];
      socket.emit('keyup', {key: e.key});
      // console.log("sending keyup: ", e.key);
    }
  });

  $(document).keydown(function(e) {
    e.preventDefault();
    if(!keys[e.keyCode]) {
      keys[e.keyCode] = true;
      socket.emit('keydown', {key: e.key});
      // console.log('sending keydown: ', e.key);
    }
  });
})();
