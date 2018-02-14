var socket = io.connect('http://localhost:3000');

socket.on('ok', function (data) {
  console.log(data);
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

$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
          socket.emit('keydown', {key: "left"});
          break;

        case 38: // up
          socket.emit('keydown', {key: "up"});
          break;

        case 39: // right
          socket.emit('keydown', {key: "right"});
          break;

        case 40: // down
          socket.emit('keydown', {key: "down"});
          break;

        default: return;
    }
    e.preventDefault();
});
