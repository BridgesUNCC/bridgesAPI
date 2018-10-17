(function() {
  var socket = null;

  /* If logged in, bind handler socket connection */
  if(user) {
    // console.log(user.username+"_"+assignmentNumber);
    d3.select("#socketConnect").on("click", socketConnect);
  } else {
    d3.select("#socketStatus").text("Please log in to use interactive games!");
    return;
  }

  /* Disconnect the current client socket */
  function socketDisconnect() {
    socket.off();
    socket.disconnect();

    // unbind key capture functions
    $(document).unbind('keyup');
    $(document).unbind('keydown');

    // modify socket nav and status items
    d3.select("#socketConnect").on('click', null);
    d3.select("#socketConnect").select(".nav-label").text("Connect to Game");
    d3.select("#socketConnect").on('click', socketConnect);

    d3.select("#socketStatus")
      .text("Disconnected.")
      .classed("alert alert-info", true)
      .classed("alert-danger alert-warning alert-success", false);
  }

  /* Connect the client socket to the server */
  function socketConnect() {

    // modify socket nav and status items
    d3.select("#socketStatus")
      .classed("alert alert-warning", true)
      .classed("alert-danger alert-success alert-info", false)
      .text("Connecting ... ");

    d3.select("#socketConnect").on('click', null);
    d3.select("#socketConnect").select(".nav-label").text("Disconnect");
    d3.select("#socketConnect").on('click', socketDisconnect);

    /* Live socket server */
    socket = io.connect('https://bridges-games.herokuapp.com', {
      transports: ['websocket']
    });

    /* Localhost testing server */
    // socket = io.connect('localhost:3000',{
    //   transports: ['websocket']
    // });

    /* Automatically register credentials to join the correct channel */
    socket.on('connect', function (data) {
      socket.emit('credentials', JSON.stringify({user: user.username, assignment: assignmentNumber}));
    });

    /* Handle connection announcements (update status to alert user) */
    socket.on('announcement', function (data) {
      d3.select("#socketStatus")
        .classed("alert alert-warning", true)
        .classed("alert-danger alert-success alert-info", false);

      var status = "Connected! ";
      if(data.userCount) {
        // the current browser tab is the only socket connection
        if(data.userCount == 1) {
          status += "(make sure you run your program too!)";
        } else
        // there are multiple tabs and/or multiple client programs running
        if(data.userCount > 2) {
          status += "(make sure you only have one browser tab and one program running!)";
        } else {
          d3.select("#socketStatus")
            .classed("alert alert-success", true)
            .classed("alert-danger alert-warning alert-info", false);
        }
      }
      d3.select("#socketStatus").text(status);
    });

    socket.on("disconnect", function (data) {
      console.log('disconnecting...', data);
    });

    // deprecated
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

    /* The server sends a gamegrid object */
    socket.on('gamegrid:send', function(gamegridData) {
      // var currTime = Date.now();
      // if(currTime-prevTime > 60) {
      //   console.log("Long time between gamegrid:send events:", currTime - prevTime);
      // }
      // prevTime = currTime;

      // find gamegrid among visualizations?
      var gamegrid = BridgesVisualizer.visualizations[0];
      var gamegridObj = JSON.parse(gamegridData.gridData);

      // draw the current gamegrid
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
  }
})();
