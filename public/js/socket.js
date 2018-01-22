var socket = io('http://localhost:3000');

socket.on('ok', function (data) {
  console.log(data);
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
